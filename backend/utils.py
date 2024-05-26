from Crypto import Random
from Crypto.Cipher import AES
from Crypto.Util import Counter
from Crypto.Random import get_random_bytes
import hashlib
import hmac
import os
from base64 import b64encode, b64decode
from datetime import datetime
import binascii
from db import retrieve_nonce_tag_from_db

# Configurações
SALT_LENGTH = 32  # Length of the salt in bytes
HASH_NAME = 'sha512'  # Hashing algorithm
ITERATIONS = 100000  # Number of iterations for PBKDF2

def generate_salt(length=SALT_LENGTH):
    """Generate a random salt of the specified length."""
    return os.urandom(length)

def hash_password(password, salt=None):
    """Hash the password using PBKDF2-HMAC-SHA-512 algorithm with salt."""
    if salt is None:
        salt = generate_salt()
    
    # Derive the key using PBKDF2-HMAC-SHA-512
    hash_value = hashlib.pbkdf2_hmac(
        HASH_NAME,
        password.encode('utf-8'),
        salt,
        ITERATIONS
    )
    
    # Encode the salt and hash into base64 for secure storage
    salt_b64 = b64encode(salt).decode('utf-8')
    hash_b64 = b64encode(hash_value).decode('utf-8')
    
    return f"{salt_b64}${hash_b64}"

def check_password(stored_password, provided_password):
    """Check if the provided password matches the stored hashed password."""
    salt_b64, hash_b64 = stored_password.split('$')
    
    salt = b64decode(salt_b64)
    stored_hash = b64decode(hash_b64)
    
    provided_hash = hashlib.pbkdf2_hmac(
        HASH_NAME,
        provided_password.encode('utf-8'),
        salt,
        ITERATIONS
    )
    
    return stored_hash == provided_hash

# create a unique and consistent 16-byte (128-bit) AES encryption key
def derive_key(secret, email, timestamp):
    """Derive a key for AES encryption using HMAC."""

    truncated_timestamp = timestamp[:16]  # Format: 'YYYY-MM-DDTHH:MM'
    message = f'{email}{truncated_timestamp}'.encode('utf-8')
    return hmac.new(secret.encode('utf-8'), message, hashlib.sha256).digest()[:16]  # 16 bytes for AES-128

def pad(s, aes_mode_length):
    """Pad the plaintext to be a multiple of the AES block size."""
    return s + b"\0" * (aes_mode_length - len(s) % aes_mode_length)

def unpad(s):
    """Remove padding from the plaintext."""
    return s.rstrip(b"\0")

def encrypt_gcm(file_content, key, nonce):
    """Encrypt the file content using AES-GCM mode."""
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(file_content)
    return nonce, ciphertext, tag

def decrypt_gcm(nonce, ciphertext, tag, key):
    """Decrypt the ciphertext using AES-GCM mode."""
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext

def encrypt(message, key, aes_mode, sha_algorithm, iv_gmac, aes_mode_length):
    """Encrypt the file content using AES encryption with the specified mode."""
    if aes_mode == AES.MODE_CTR:
        # Generate a random IV
        iv = Random.new().read(aes_mode_length)
        # Create a counter object
        counter = Counter.new(128, initial_value=int.from_bytes(iv, byteorder='big'))
        # Initialize AES cipher in CTR mode with the counter
        cipher = AES.new(key, AES.MODE_CTR, counter=counter)
        return iv + cipher.encrypt(message)
    else:
        message = pad(message,aes_mode_length)
        if sha_algorithm != "GMAC":
            # Generate a random IV
            iv = get_random_bytes(aes_mode_length)
            cipher = AES.new(key, aes_mode, iv)

            return iv + cipher.encrypt(message)
        else:
            cipher = AES.new(key, aes_mode, iv_gmac)

            return iv_gmac + cipher.encrypt(message)

def encrypt_file(file_content, key, aes_mode, sha_algorithm, iv_gmac, aes_mode_length):
    """Encrypt the file content using AES encryption."""    
    if aes_mode == AES.MODE_GCM:
        nonce = get_random_bytes(12)
        nonceReturned, enc, tag = encrypt_gcm(file_content, key, nonce)
        return enc, tag, nonceReturned
    else:
        enc = encrypt(file_content, key, aes_mode, sha_algorithm, iv_gmac, aes_mode_length)

        return enc, None, None

def decrypt(ciphertext, key, aes_mode, aes_mode_length):
    """Decrypt the ciphertext using AES encryption."""
    iv = ciphertext[:aes_mode_length]
    if aes_mode == AES.MODE_CTR:
        # Create a counter object with the extracted IV
        counter = Counter.new(128, initial_value=int.from_bytes(iv, byteorder='big'))
        # Initialize AES cipher in CTR mode with the counter
        cipher = AES.new(key, AES.MODE_CTR, counter=counter)
    else:
        cipher = AES.new(key, aes_mode, iv)

    plaintext = cipher.decrypt(ciphertext[aes_mode_length:])
    return plaintext.rstrip(b"\0")

def decrypt_file(encrypted_filename, file_content, key, aes_mode, aes_mode_length):
    """Decrypt the file content using AES encryption."""
    if aes_mode == AES.MODE_GCM:
        nonce, tag = retrieve_nonce_tag_from_db(encrypted_filename)
        dec = decrypt_gcm(nonce, file_content, tag, key)
        return dec
    else:
        iv = file_content[:aes_mode_length]
        plaintext = decrypt(file_content, key, aes_mode, aes_mode_length)
        return plaintext

def gen_gmac(key, iv, data):
    """Generate a GMAC (Galois Message Authentication Code) for the provided data."""
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv) # Initialize the cipher with the key and IV
    cipher.update(data) # Update the cipher with the plaintext data
    tag = cipher.digest() # Generate the MAC (tag)
    return tag