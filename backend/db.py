from mysql.connector import connect, Error
from dotenv import load_dotenv
import os
import base64

# Load environment variables from .env file
load_dotenv()

# Database configuration
db_config = {
    'host': os.getenv('db_config_host'),
    'user': os.getenv('db_config_user'),
    'password': os.getenv('db_config_password'),
    'database': os.getenv('db_config_database')
}

# Test database connection
def test_connection():
    try:
        with connect(**db_config) as connection:
            print("Database connection successful")
    except Error as e:
        print(f"Error: {e}")

# Function to insert data into the database
def insertDB(sql, data):
    try:
        with connect(**db_config) as connection:
            cursor = connection.cursor()
            cursor.execute(sql, data)
            connection.commit()
            return "200"
    except Error as e:
        print(f"Error: {e}")
        return "500"

# Function to retrieve user login information from the database
def login_user(email):
    try:
        with connect(**db_config) as connection:
            cursor = connection.cursor()
            cursor.execute("SELECT username, password FROM users WHERE email = %s", (email,))
            result = cursor.fetchone()

            if result:
                return result
            else:
                return "invalid"
    except Error as e:
        print(f"Error: {e}")
        return "error"

# Function to retrieve file keys where the files decrypt date is before or equal to the current date
def get_files_after_current_date(current_date, value):
    try:
        with connect(**db_config) as connection:
            cursor = connection.cursor(dictionary=True)
            
            if value == 0:
                query = "SELECT encrypted_filename, file_key, decipherDate FROM ficheiros WHERE STR_TO_DATE(decipherDate, '%Y-%m-%dT%H:%i') = %s"
            else:
                query = "SELECT encrypted_filename, file_key, decipherDate FROM ficheiros WHERE STR_TO_DATE(decipherDate, '%Y-%m-%dT%H:%i') <= %s"

            cursor.execute(query, (current_date,))
            result = cursor.fetchall()

            # Convert file_key from binary to base64-encoded strings
            for row in result:
                if 'file_key' in row and isinstance(row['file_key'], bytes):
                    row['file_key'] = base64.b64encode(row['file_key']).decode('utf-8')

            return result
    except Error as e:
        print(f"Error: {e}")
        return "error"

# Function to retrieve nonce and tag from the database in case of GCM mode
def retrieve_nonce_tag_from_db(encrypted_filename):
    try:
        # Get the database connection
        with connect(**db_config) as connection:
            cursor = connection.cursor()
            sql_query = "SELECT nonce, tag FROM ficheiros WHERE encrypted_filename = %s"
            cursor.execute(sql_query, (encrypted_filename,))
            result = cursor.fetchone()

            if result:
                nonce, tag = result
                print("Nonce and tag retrieved from the database successfully")
                return nonce, tag
            else:
                print("No record found for the specified encrypted filename")
                return None, None
    except Error as e:
        print(f"Error retrieving nonce and tag from the database: {e}")
        return None, None