import React, {useState, useEffect} from 'react'
import Header from '../components/Header'
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import printError from '../utils/printErrorMessages';
import { Container, Row, Col } from 'reactstrap';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function Main() {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();  

  const token = localStorage.getItem('token');
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {

    // Make HTTP request to fetch user data
    api.get('/user', headers)
      .then(response => {
        console.log('response.data: ', response.data);
        setUserData(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, []);
  return (
    <>
      <Header />
      <Row style={{display: "flex", flexDirection: "column", paddingLeft: "30px"}}>
        <div style={{color: "white"}}>
            <h2 style={{color: "white"}}>Email: {email}</h2>
            <h2 style={{color: "white"}}>Username: {username}</h2>
          </div>
      </Row>
    </>
  )
}

export default Main;