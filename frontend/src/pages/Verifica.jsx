import React, {useState, useEffect} from 'react'
import Header from '../components/Header'
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import printError from '../utils/printErrorMessages';
import { Container, Row, Col } from 'reactstrap';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function Verifica() {
  const [files, setFiles] = useState([]);
  const [userData, setUserData] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());

  const navigate = useNavigate();  

  const token = localStorage.getItem('token');
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

// Fetch files function
const fetchFiles = async () => {
  try {
    // Make HTTP request to fetch user data
    const userResponse = await api.get('/user', headers);
    setUserData(userResponse.data);

    // Check if user data is available
    if (userResponse.data) {
      // Fetch files after the current date
      const filesResponse = await api.get('/after_current_date');
      setFiles(filesResponse.data);
    } else {
      // Fetch files before the current date
      const filesResponse = await api.get('/before_current_date');
      setFiles(filesResponse.data);
    }
  } catch (error) {
    // Ignore 422 error
    if (error.response && error.response.status === 422) {
      console.log('User is not logged in.');
    } else {
      console.error('Error fetching files:', error);
      printError(error);
    }
  }
};

useEffect(() => {
  fetchFiles();
}, []);

  // Update datetime every second
  useEffect(() => {
    const intervalDateTime = setInterval(() => {
      const currentDate = new Date();
      // Check if the seconds are 00 and fetch files
      if (currentDate.getSeconds() === 0) {
        fetchFiles();
      }
      setDateTime(currentDate);
    }, 1000);

    return () => clearInterval(intervalDateTime); // Cleanup on unmount
  }, []);

  // Function to get month name
  const getMonthName = (monthIndex) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    return months[monthIndex];
  };

  // Function to pad zero for single digit hours, minutes, and seconds
  const padZero = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  // Function to format datetime string
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    return formattedDate;
  };

  // Function to decode base64 encoded file key and convert to hexadecimal
  const decodeFileKey = (base64Key) => {
    try {
      // Decode base64 to original binary
      const decodedBinary = atob(base64Key);
      // Convert binary to hexadecimal
      let hexKey = '';
      for (let i = 0; i < decodedBinary.length; i++) {
        const hex = decodedBinary.charCodeAt(i).toString(16);
        hexKey += (hex.length === 2 ? hex : '0' + hex);
      }
      return '0x' + hexKey;
    } catch (error) {
      console.error('Error decoding file key:', error);
      printError(error);
      return 'Error Decoding key';
    }
  };

    // Function to copy decoded key to clipboard
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
    };
  
  return (
    <>
      <Header />
      <Row style={{display: "flex", flexDirection: "column"}}>
        <Row style={{ marginLeft: "10px", display: "flex", flexDirection: "row", paddingLeft: "30px", alignItems: "center" }}>
          <h2 style={{ color: "white" }}>Keys</h2>
        </Row>
        <Row style={{ marginLeft: "30px", marginTop: "20px", backgroundColor: "#00800095", padding: "10px", width: "95%", borderRadius: "15px"}}>
          <Col sm="4" md="4" lg="4" style={{display: "flex", justifyContent: "space-evenly", flexDirection: "row", alignItems: "center"}}>
              <h2 style={{ color: "white" }}>Key: </h2>
              <h5 style={{ color: "white", paddingLeft: "15px", margin: 0 }}>Button</h5>
            </Col>
            <Col sm="4" md="4" lg="4" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
              <h2 style={{ color: "white" }}>File: </h2>
              <h5 style={{ color: "white", paddingLeft: "15px", margin: 0 }}>encrypted_example.AES</h5>
            </Col>
            <Col sm="4" md="4" lg="4" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
              <h2 style={{ color: "white" }}>Date: </h2>
              <h5 style={{ color: "white", paddingLeft: "15px", margin: 0 }}>Date of Decryption</h5>
            </Col>
          </Row>
          {files.slice().reverse().map((file, index) => (
          <Row key={index} style={{ marginLeft: "30px", marginTop: "20px", backgroundColor: "#00800095", padding: "10px", width: "95%", borderRadius: "15px"}}>
            <Col sm="4" md="4" lg="4" style={{display: "flex", justifyContent: "space-evenly", flexDirection: "row", alignItems: "center"}}>
              <h2 style={{ color: "white" }}>Key: </h2>
              {/* <h5 style={{ color: "white", paddingLeft: "15px", margin: 0 }}>{decodeFileKey(file.file_key)}</h5> */}
              <Button
                onClick={() => copyToClipboard(decodeFileKey(file.file_key))}
                style={{ marginLeft: '10px' }}
                variant="contained"
              >
                Copy
              </Button>
            </Col>
            <Col sm="4" md="4" lg="4" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
              <h2 style={{ color: "white" }}>File: </h2>
              <h5 style={{ color: "white", paddingLeft: "15px", margin: 0 }}>{file.encrypted_filename}</h5>
            </Col>
            <Col sm="4" md="4" lg="4" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
              <h2 style={{ color: "white" }}>Date: </h2>
              <h5 style={{ color: "white", paddingLeft: "15px", margin: 0 }}>{formatDateTime(file.decipherDate)}</h5>
            </Col>
          </Row>
          ))}
      </Row>
    </>
  )
}

export default Verifica;