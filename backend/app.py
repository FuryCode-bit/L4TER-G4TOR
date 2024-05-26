# Generate Self Signed Certificates: 
## openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

### Execute: flask run --cert=cert.pem --key=key.pem

# Windows
#py -3 -m venv .venv
#.venv\scripts\activate

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
from db import insertDB, login_user, get_files_after_current_date
from utils import hash_password, check_password, derive_key, encrypt_file as encrypt_file_utils, decrypt_file as decrypt_file_utils, gen_gmac
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from werkzeug.utils import secure_filename
from datetime import datetime
import os

from dotenv import load_dotenv

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from base64 import b64encode
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
import binascii
import hmac
import hashlib

app = Flask(__name__, static_folder="./build", static_url_path="/")

# Load environment variables from .env file
load_dotenv()

# Access the variables
SECRET_KEY = os.getenv('SECRET_KEY')
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
PRIVATE_KEY_STR = os.getenv('PRIVATE_KEY_STR')

app.config['JWT_SECRET_KEY'] = SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the private key
PRIVATE_KEY = RSA.import_key(PRIVATE_KEY_STR)
PUBLIC_KEY = PRIVATE_KEY.publickey()

AES_MODES = {
  'MODE_CBC': AES.MODE_CBC,
  'MODE_CFB': AES.MODE_CFB,
  'MODE_OFB': AES.MODE_OFB,
  'MODE_CTR': AES.MODE_CTR,
  'MODE_GCM': AES.MODE_GCM
}

AES_MODES_STR = {
  'MODE_CBC': 'AES-CBC',
  'MODE_CFB': 'AES-CFB',
  'MODE_OFB': 'AES-OFB',
  'MODE_CTR': 'AES-CTR',
  'MODE_GCM': 'AES-GCM',
}

AES_MODE_LENGTH = {
  'MODE_CBC': AES.block_size,
  'MODE_CFB': 16,
  'MODE_OFB': AES.block_size,
  'MODE_CTR': AES.block_size,
  'MODE_GCM': 12 # For GCM, the initialization vector size is 12 bytes
}

HMAC_SHA_LENGTH = {
    'sha1': 20,
    'sha224': 28,
    'sha256': 32,
    'sha384': 48,
    'sha512': 64,
    'GMAC': 16,
}

cors = CORS(app, resources={r'*': {'origins': 'http://localhost:3000'}})
jwt = JWTManager(app)

@app.route("/")

# This route is designed to serve the main HTML file (index.html) for the frontend application.
# It ensures that the frontend can be accessed and properly rendered when the base URL of 
# the application is visited.

@cross_origin(origin='*',headers=['Content-Type'])
def hello_world():
        return app.send_static_file("index.html")

@app.route("/register", methods=['POST'])

# This route handles user registration by accepting a POST request with user details, such as username, 
# email, and password. It processes the data, hashes the password, and inserts the new user record 
# into the database. Thereby registering the incoming user.

def register():
    if request.method == 'POST':
        try:
            # Extracting the data from the received JSON
            data_received = request.json
            username = data_received.get('username')
            email = data_received.get('email')
            password = data_received.get('password')

            if not username or not email or not password:
                return jsonify({"error": "Missing required fields"}), 400

            hashed_password = hash_password(password)

            sql = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
            data = (username, email, hashed_password)

            if insertDB(sql, data):
                return jsonify({"message": "User created successfully"}), 201
            else:
                return jsonify({"Error": "Failed to create user"}), 502
        except Exception as e:
            return jsonify({"error": "Something went wrong while processing the data"}), 505

@app.route("/login", methods=['POST'])

# This route handles user login by accepting a POST request with user details, 
# such as email and password. It verifies the credentials, and if valid, generates and returns 
# an access token (JWT), to be stored as a cookie.

def login():
    if request.method == 'POST':
        try:
            # Extracting the data from the received JSON
            data_received = request.json
            email = data_received.get('email')
            password = data_received.get('password')

            if not email or not password:
                return jsonify({"error": "Missing required fields"}), 400

            result = login_user(email)

            if result and check_password(result[1], password):
                access_token = create_access_token(identity={"email": email, "username": result[0]})
                return jsonify({"message": "Login successful", "token": access_token}), 200
            else:
                return jsonify({"error": "Invalid email or password"}), 505
        except Exception as e:
            return jsonify({"error": "Invalid email or password"}), 505
        
@app.route("/encrypt", methods=['POST'])

# This route handles the encryption of files by accepting a POST request with user details and file 
# information. It uses AES for encryption, HMAC for integrity verification, and RSA for digital 
# signatures. The original file, its signature and the encrypted file are then stored in the uploads folder.

@jwt_required()
def encrypt_file():
    # Extracting the data from the received request
    email = request.form.get('email')
    timestamp = request.form.get('timestamp') 
    file = request.files.get('file')
    sha_algorithm = request.form.get('hmac_sha')
    aes_mode = request.form.get('aes_mode')

    # Ensures the filename is safe and secure for the file system. 
    # Preventing security issues related to file paths and file names.
    filename = secure_filename(file.filename)

    encrypted_filename = None
    iv = None

    # Checks for missing required fields
    if not email or not timestamp or not file:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Validates the timestamp format
        datetime.strptime(timestamp, '%Y-%m-%dT%H:%M')
    except ValueError:
        return jsonify({"error": "Invalid timestamp format. Use YYYY-MM-DDTHH:MM"}), 400

    key = derive_key(SECRET_KEY, email, timestamp)
    file_content = file.read()

    # Generates HMAC or GMAC depending of the option the user chose
    if sha_algorithm != "GMAC":
        hmac_algorithm = getattr(hashlib, sha_algorithm)
        hmac_sha = hmac.new(key, file_content, hmac_algorithm).digest()
    else:
        iv = get_random_bytes(16)
        hmac_sha = gen_gmac(key, iv, file_content)

    # Encrypts file using AES (AES-128-CBC || AES-128-CFB || AES-128-OFB || AES-128-CTR || AES-128-GCM)
    if aes_mode == AES.MODE_GCM:
        ciphertext, tag, nonce = encrypt_file_utils(file_content, key, aes_mode, sha_algorithm, iv, AES_MODE_LENGTH[aes_mode])
        encrypted_content = iv + ciphertext if sha_algorithm == "GMAC" else ciphertext
        encrypted_filename = f"{filename}.{AES_MODES_STR[aes_mode]}"
        data = (encrypted_filename, key, nonce, tag, timestamp)
    else:
        ciphertext, tag, nonce = encrypt_file_utils(file_content, key, AES_MODES[aes_mode], sha_algorithm, iv, AES_MODE_LENGTH[aes_mode])
        encrypted_content = iv + hmac_sha + ciphertext if sha_algorithm == "GMAC" else hmac_sha + ciphertext
        encrypted_filename = f"{filename}.{AES_MODES_STR[aes_mode]}"
        data = (encrypted_filename, key, nonce, tag, timestamp)

    # Sign the original file content   
    h = SHA256.new(file_content)
    signature = pkcs1_15.new(PRIVATE_KEY).sign(h)
    signature_filename = f"{encrypted_filename}.sig"

    # Inserts encrypted file details into the database
    db_response = insertDB("INSERT INTO ficheiros (encrypted_filename, file_key, nonce, tag, decipherDate) VALUES (%s, %s, %s, %s, %s)", data)
    if db_response == "500":
        return jsonify({"error": "Database insertion failed"}), 500

    # Construct the file path using the file name
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], encrypted_filename)

    # Write the encrypted content to the file
    with open(file_path, 'wb') as encrypted_file:
        encrypted_file.write(encrypted_content)
    
    # Construct the signature path using the signature file name
    signature_path = os.path.join(app.config['UPLOAD_FOLDER'], signature_filename)
    
    # Write the signature to the file
    with open(signature_path, 'wb') as sig_file:
        sig_file.write(signature)

    # Returns a JSON response with encryption details
    return jsonify({"message": "File encrypted successfully", "token": {
        "email": email,
        "decipher_date": timestamp,
        "filename": encrypted_filename,
        "ciphertext": b64encode(ciphertext).decode('utf8'),
        "signature": b64encode(signature).decode('utf8')
    }}), 200

@app.route("/decrypt", methods=['POST'])

# This route handles the decryption of files by accepting a POST request with user authentication and encrypted file details. 
# It decrypts the file using AES encryption with HMAC/GMAC for integrity verification and RSA for digital signature verification. 
# The decrypted file is then saved in the uploads folder.

@jwt_required()
def decrypt_file():
    # Retrieves the user info from the JWT token
    current_user = get_jwt_identity()

    # Extracting the data from the received request
    file = request.files.get('file')
    key_str = request.form.get('key')
    sha_algorithm = request.form.get('hmac_sha')
    aes_mode = request.form.get('aes_mode')

    email = current_user['email']
    timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M')

    # Ensures the filename is safe and secure for the file system. 
    # Preventing security issues related to file paths and file names.
    filename = secure_filename(file.filename)

    # Checks for missing required fields
    if not key_str or not file:
        return jsonify({"error": "Missing required fields"}), 400

    # Convert the given key string to bytes
    key_bytes = binascii.unhexlify(key_str.encode('utf8')[2:])
    encrypted_content = file.read()

    try:
        if aes_mode != AES.MODE_GCM:

            if sha_algorithm != "GMAC":
                # Splitting encrypted content into HMAC and ciphertext
                hmac_sha = encrypted_content[:HMAC_SHA_LENGTH[sha_algorithm]]
                ciphertext = encrypted_content[HMAC_SHA_LENGTH[sha_algorithm]:]
            else:
                # In case of GMAC it is spliting the encrypted content into IV, HMAC and ciphertext
                iv_gmac = encrypted_content[:HMAC_SHA_LENGTH[sha_algorithm]]
                gmac = encrypted_content[HMAC_SHA_LENGTH[sha_algorithm]:2 * HMAC_SHA_LENGTH[sha_algorithm]]
                ciphertext = encrypted_content[2 * HMAC_SHA_LENGTH[sha_algorithm]:]
        else:
            ciphertext = encrypted_content
            
        # Decrypting the file content
        plaintext = decrypt_file_utils(filename, ciphertext, key_bytes, AES_MODES[aes_mode], AES_MODE_LENGTH[aes_mode])

        try:

            # Verify the RSA signature
            signature_filename = f"{filename}.sig"
            with open(os.path.join(app.config['UPLOAD_FOLDER'], signature_filename), 'rb') as sig_file:
                signature = sig_file.read()
        
            h = SHA256.new(plaintext)

            pkcs1_15.new(PUBLIC_KEY).verify(h, signature)

        except FileNotFoundError:
            # Handle the missing signature file error
            return jsonify({"error": f"Signature file not found: {signature_filename}"}), 404
        except (ValueError, TypeError):
            # Handle the missing signature verification failed error
            return jsonify({"error": "Signature verification failed. The file may have been tampered with."}), 450
        
        if aes_mode != AES.MODE_GCM:
            # Integrity check for non-GMAC modes
            if sha_algorithm != "GMAC":
                hmac_algorithm = getattr(hashlib, sha_algorithm)
                calculated_hmac_sha = hmac.new(key_bytes, plaintext, hmac_algorithm).digest()

                if hmac_sha != calculated_hmac_sha:
                    return jsonify({"error": "Integrity check failed. The file may have been tampered with."}), 420
            
            # Integrity check for GMAC mode
            else:
                # calculated_hmac_sha = gen_gmac(key, iv, plaintext)
                calculated_gmac = gen_gmac(key_bytes, iv_gmac, plaintext)

                if gmac != calculated_gmac:
                    return jsonify({"error": "Integrity check failed. The file may have been tampered with."}), 420

    except ValueError:
        # Handle the Incorrect key or corrupted data error
        return jsonify({"error": "Decryption failed. Incorrect key or corrupted data"}), 400

    # Writing decrypted content to file
    decrypted_filename = '.'.join(filename.split('.')[:-1])
    decrypted_filepath = os.path.join(app.config['UPLOAD_FOLDER'], decrypted_filename)

    with open(decrypted_filepath, 'wb') as decrypted_file:
        decrypted_file.write(plaintext)

    return jsonify({"message": "File decrypted successfully", "token": {
        "email": email,
        "decipher_date": timestamp,
        "filename": decrypted_filename,
    }}), 200

@app.route("/download/<filename>", methods=['GET'])

# This route allows users to download files by providing the filename as a parameter in the URL. 
# The file is located in the uploads folder with the specified filename and when requested 
#is sent as an attachment in the response.

@jwt_required()
def download_file(filename):
    try:
        # Constructs the file path using the filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # Sends the file as an attachment in the response
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        # Handles any errors that occur during file retrieval
        return jsonify({"error": str(e)}), 500

@app.route("/after_current_date", methods=['GET'])

# Retrieves keys from files uploaded with the decrypt date equal to the current date.

def files_after_current_date():

    current_date = datetime.now().strftime('%Y-%m-%dT%H:%M')
    files = get_files_after_current_date(current_date, 1)
    return jsonify(files), 200

@app.route("/before_current_date", methods=['GET'])

# Retrieves keys from files uploaded where the decryption date is equal to or before the current date.

def files_before_current_date():

    current_date = datetime.now().strftime('%Y-%m-%dT%H:%M')
    files = get_files_after_current_date(current_date, 0)
    return jsonify(files), 200

# This route is protected and requires a valid JWT access token for access.
@app.route("/protected", methods=['GET'])
@jwt_required()
def protected():
    # Get the identity (email) from the access token
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# API endpoint to fetch user data
@app.route("/user", methods=['GET'])
@jwt_required()  # Requires a valid access token to access this endpoint
def get_user():
    current_user = get_jwt_identity()
    return jsonify(email=current_user['email'], username=current_user['username']), 200

if __name__ == "__main__":
    # Runs the Flask app with SSL/TLS encryption enabled
    app.run(ssl_context=('cert.pem', 'key.pem'))