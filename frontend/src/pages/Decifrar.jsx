import React, {useState, useEffect} from 'react'
import Header from '../components/Header'
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import printError from '../utils/printErrorMessages';
import { Container, Row, Col } from 'reactstrap';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

function Decifrar() {
    const [userData, setUserData] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [file, setFile] = useState(null);
    const [timestamp, setTimestamp] = useState('');
    const [key, setKey] = useState(null);
    const [sha, setSha] = useState('sha256');
    const [aes_mode, setAESMode] = useState('MODE_CBC');

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

    function handleChange(event) {
      setFile(event.target.files[0]);
      console.log("event.target: ", event.target.files[0]);
    }
    
    const handleChange_SHA = (event) => {
      setSha(event.target.value);
    };
  
    const handleChange_AES = (event) => {
      setAESMode(event.target.value);
    };

    const handleSubmit = async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('aes_mode', aes_mode);
      formData.append('hmac_sha', sha);

      console.log("formData: ", file, key, aes_mode, sha);

      try {
          const response = await api.post('/decrypt', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${token}`
              }
          });

          console.log(response.data);
          if (response.data.token.filename) {
            downloadFile(response.data.token.filename);
        }
    } catch (error) {
        console.error('Error:', error);
        printError(error);
    }
  };
  
  const downloadFile = async (filename) => {
    try {
      const response = await api.get(`/download/${filename}`, {
        responseType:
        'blob', // Set responseType to 'blob' to handle binary data
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Create a blob URL for the response data
      console.log("file response.data: ", response.data)
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set the download attribute with the filename
      document.body.appendChild(link);

      // Trigger the click event to start the download
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      printError(error);
    }
  };

    return (
      <>
        <Header />
        <Row style={{display: "flex", height: "86vh", alignItems: "center", }}>
          <Col sm="12" md="4" lg="4">
  
          </Col>
          <Col sm="12" md="4" lg="4" style={{display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#00800095", height: "75%", borderRadius: "5%", color: "white"}}>
              <Row style={{display: "flex", justifyContent: "center"}}>
              <TextField
                      style={{ width: "70%", margin: "15px", borderRadius: "15px", backgroundColor: "white", color: "black" }}
                      type="file"
                      name="Ficheiro"
                      variant="outlined"
                      onChange={handleChange}
                  />
              </Row>
              <Row style={{display: "flex", justifyContent: "center"}}>
                  <TextField
                      style={{ width: "70%", margin: "15px", borderRadius: "15px", backgroundColor: "white", color: "black" }}
                      id="key"
                      name="key"
                      label="Chave de Cifra"
                      onChange={(e) => setKey(e.target.value)}
                      variant="outlined"
                  />
              </Row>
              <Row style={{display: "flex", justifyContent: "center"}} >
                <Row style={{display: "flex", width: "70%"}}>
                  <Col style={{display: "flex", justifyContent:"flex-start"}}>
                  {aes_mode !== 'MODE_GCM' && (
                    <FormControl style={{ width: "100%", margin: "15px", borderRadius: "15px", backgroundColor: "white", color: "black" }}>
                      <InputLabel id="demo-simple-select-label">HMAC-SHA</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={sha}
                        label="HMAC-SHA"
                        onChange={handleChange_SHA}
                      >
                        <MenuItem value={"sha256"}>sha256</MenuItem>
                        <MenuItem value={"sha384"}>sha384</MenuItem>
                        <MenuItem value={"sha512"}>sha512</MenuItem>
                        <MenuItem value={"GMAC"}>GMAC</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  </Col>
                  <Col style={{ display: "flex", justifyContent:"flex-end"}}>
                    <FormControl style={{ width: "100%", margin: "15px", borderRadius: "15px", backgroundColor: "white", color: "black" }}>
                      <InputLabel id="demo-simple-select-label">Modos</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={aes_mode}
                        label="Modos"
                        onChange={handleChange_AES}
                      >
                        <MenuItem value={"MODE_CBC"}>Modo_CBC</MenuItem>
                        <MenuItem value={"MODE_CFB"}>Modo_CFB</MenuItem>
                        <MenuItem value={"MODE_OFB"}>Modo_OFB</MenuItem>
                        <MenuItem value={"MODE_CTR"}>Modo_CTR</MenuItem>
                        <MenuItem value={"MODE_GCM"}>Modo_GCM</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
              </Row>
              <Row style={{display: "flex", justifyContent: "center"}}>
                  <Button variant="contained" onClick={handleSubmit} style={{width:"70%", margin: "15px", height: "50px", borderRadius: "10px", backgroundColor: "black"}}>DECRYPT</Button>
              </Row>
              <Row style={{display: "flex", justifyContent: "center", paddingTop: "30px"}}>
                  <h5 style={{color:"white"}}>{username} | </h5>
                  <h5 style={{color:"white", marginLeft: "10px", fontWeight: "500"}}>{email}</h5>
              </Row>
          </Col>
          <Col sm="12" md="3" lg="3"> 
          </Col>
      </Row>
      </>
    )
  }

export default Decifrar