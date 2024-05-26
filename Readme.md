# L4TER-G4TOR

<!-- Project L4TER-G4TOR: https://github.com/FuryCode-bit/L4TER-G4TOR -->
<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/FuryCode-bit/L4TER-G4TOR">
    <img src="readme/fe.png" alt="Logo" height="80">
  </a>

  <h3 align="center">L4TER-G4TOR</h3>

  <p align="center"> A Criptographic Time Capsule
    <br />
    <a href="https://github.com/FuryCode-bit/L4TER-G4TOR"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!-- <a href="https://github.com/FuryCode-bit/L4TER-G4TOR">View Demo</a> -->
    ·
    <a href="https://github.com/FuryCode-bit/L4TER-G4TOR/issues">Report Bug</a>
    <!-- ·
    <a href="https://github.com/FuryCode-bit/L4TER-G4TOR/issues">Request Feature</a> -->
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#implemented-functionalities">Implemented Functionalities</a></li>
      </ul>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

![Product Name Screen Shot][project-screenshot]

### Objective

**Objective**: The objective of this work is to develop a system that allows encrypting messages (files) that can only be decrypted at a specific day and time. 

### System Architecture
To ensure security, the system should implement a client-server architecture (e.g., a web application), where the server component is clearly separated from the client. The main functionalities of the server include:
- Generating cipher keys for any specified moment.
- Encrypting messages with generated keys.

### Main Functionalities
The system should have three main functionalities, possibly available through three interfaces:

1. **User Request Interface**:
   - Allows users to request the encryption of a file that can only be opened at a specific date and time.
   - Users input the date, time, and file through an interface (e.g., a form).
   - The system generates a unique AES cipher key depending on a secret known only to the system, the user's username (email), and the date and time.
   - The file is encrypted, and the ciphertext is returned to the user without the cipher key.

2. **Decryption Key Interface**:
   - Any user can access the system to check which key opens the ciphertexts for the current date and time.
   - Keys are displayed during the specified period and are not accessible before or after.

3. **Decryption Interface**:
   - Allows users to submit a cipher key and a previously encrypted file.
   - Returns the decrypted file if decryption is successful.

### Basic Functionalities
The system supports the following basic functionalities:

1. **Key Generation**:
   - Generates cipher keys using a cryptographic algorithm.
   - Keys depend on email, a secret, and the current date and time.

2. **File Encryption**:
   - Generates cipher keys for a specified date and time.
   - Encrypts a file with the generated key.

3. **Message Authentication**:
   - Generates HMAC-SHA256 message authentication codes attached to the ciphertext.

4. **Decryption**:
   - Attempts to decrypt a submitted ciphertext using a provided key.
   - Verifies the message authentication code.

### Additional Enhancements
The system can be further enhanced by implementing the following functionalities:

1. **Cipher Selection**:
   - Allows choosing between AES-128-CBC and AES-128-CTR ciphers.

2. **HMAC Function Selection**:
   - Allows choosing between HMAC-SHA256 and HMAC-SHA512 HMAC functions.

3. **Digital Signatures**:
   - Uses RSA digital signatures in addition to message authentication codes.

4. **User Registration**:
   - Enables simple user registration through email and password.

5. **Access to Past Keys**:
   - Allows registered users to access past cipher keys.

6. **Additional Features**:
   - Any other functionalities considered interesting.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Implemented Functionalities

### Main Functionalities

1. **User Request Interface**:
   - Users are able to input the date, time, and file through the interface.
   - The system generates a unique AES cipher key depending on a secret known only to the system, the user's username (email), and the date and time.
   - The file is encrypted, and the ciphertext is returned to the user without the cipher key.

2. **Decryption Key Interface**:
   - Any user can access the system to check which key opens the ciphertexts for the current date and time.
   - Keys are displayed during the specified period and are not accessible before or after.

3. **Decryption Interface**:
   - Allows users to submit a cipher key and a previously encrypted file.
   - Returns the decrypted file if decryption is successful and if the digital signature is valid.

4. **User Login and Registration**:
   - Enables simple user login, registration through email and password.

### Basic Functionalities
The system supports the following basic functionalities:

1. **Key Generation**:
   - Generates cipher keys using a cryptographic algorithm.
   - Keys depend on email, a secret, and the current date and time.

2. **File Encryption**:
   - Generates cipher keys for a specified date and time using (AES-128-CBC || AES-128-CFB || AES-128-OFB || AES-128-CTR || AES-128-GCM).
   - Encrypts a file with the generated key.

3. **Message Authentication**:
   - The app can generate (HMAC-SHA256 || HMAC-SHA384 || HMAC-SHA512 || GMAC) message authentication codes attached to the ciphertext.
   - The app uses RSA digital signatures in addition to message authentication codes.

4. **Decryption**:
   - Attempts to decrypt a submitted ciphertext using a provided key.
   - Verifies the message authentication code.

5. **Access to Past Keys**:
   - Allows registered users to access past cipher keys.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![Flask][flask]][Flask-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/FuryCode-bit/L4TER-G4TOR.git
   ```

2. Install Python packages
      ```sh
   cd backend
   pip3 install -r requirements.txt
   ```

3. Install ReactJS packages and run build 
      ```sh
   cd frontend
   npm install
   npm run build
   cd ..
   mv frontend/build backend/
   ```
4. Move build to backend folder
      ```sh
   mv frontend/build backend/
   ```

5. Import database script to your sql server
   ```sh
    script.sql
   ```

6. Generate Self Signed Certificates for the server
   ```sh
    openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
   ```

7. Create a .env file
   ```plaintext
   
   SECRET_KEY="YourSecretKey"

   UPLOAD_FOLDER=uploads

   db_config_host=choose_host
   db_config_user=choose_user
   db_config_password=choose_password
   db_config_database=choose_db_name

   # for testing purposes the PRIVATE_KEY_STR is the same as the key inside key.pem
   
   PRIVATE_KEY_STR="-----BEGIN PRIVATE KEY-----
   -----END PRIVATE KEY-----"
   ```

6. Execute
   ```sh
    flask run --cert=cert.pem --key=key.pem
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Issues -->
## Issues

See the [open issues](https://github.com/FuryCode-bit/L4TER-G4TOR/issues) for a full list of proposed features (and known issues).

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/FuryCode-bit/L4TER-G4TOR.svg?style=for-the-badge
[contributors-url]: https://github.com/FuryCode-bit/L4TER-G4TOR/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/FuryCode-bit/L4TER-G4TOR.svg?style=for-the-badge
[forks-url]: https://github.com/FuryCode-bit/L4TER-G4TOR/network/members
[stars-shield]: https://img.shields.io/github/stars/FuryCode-bit/L4TER-G4TOR.svg?style=for-the-badge
[stars-url]: https://github.com/FuryCode-bit/L4TER-G4TOR/stargazers
[issues-shield]: https://img.shields.io/github/issues/FuryCode-bit/L4TER-G4TOR.svg?style=for-the-badge
[issues-url]: https://github.com/FuryCode-bit/L4TER-G4TOR/issues
[license-shield]: https://img.shields.io/github/license/FuryCode-bit/L4TER-G4TOR.svg?style=for-the-badge
[license-url]: https://github.com/FuryCode-bit/L4TER-G4TOR/blob/master/LICENSE.txt

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/bernardeswebdev

[project-screenshot]: readme/projeto.png

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[flask]: https://img.shields.io/badge/flask-0769AD?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/en/3.0.x/
