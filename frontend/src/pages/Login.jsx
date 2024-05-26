import React, {useState, useEffect} from 'react';
import api from '../utils/api';
import printError from '../utils/printErrorMessages';
import Header from '../components/Header';
import {Container, Row, Col} from 'reactstrap'
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';

import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';

import Button from '@mui/material/Button';

function Login() {

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async () => {
        // Perform input validation
        if (!formData.email || !formData.password) {
            alert('Missing required fields');
            return;
        }

        // Regular expression for email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Check if email has a valid format
        if (!emailRegex.test(formData.email)) {
            alert('Invalid email format');
            return;
        }

        try {
            const response = await api.post('/login', formData);
            if (response.status === 200) {
                // Login successful
                const { token } = response.data;
                localStorage.setItem('token', token); // Store the token in local storage
                navigate("/");
            } else {
                // Handle error
                console.log('Login failed');
            }
        } catch (error) {
            console.log('Error:', error);
            printError(error);
        }
    };

  return (
    <>
    <Header />
    <Row style={{display: "flex", height: "86vh", alignItems: "center", }}>
        <Col sm="12" md="4" lg="4" style={{backgroundColor: "red"}}>

        </Col>
        <Col sm="12" md="4" lg="4" style={{display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#00800095", height: "65%", borderRadius: "5%", color: "white"}}>
            <Row style={{display: "flex", justifyContent: "center"}}>
                <TextField
                    style={{ width: "70%", margin: "15px", borderRadius: "15px", backgroundColor: "white", color: "black" }}
                    id="email"
                    name="email"
                    label="Email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                />
            </Row>
            <Row style={{display: "flex", justifyContent: "center"}}>
                <OutlinedInput
                    style={{ width: "70%", margin: "15px", borderRadius: "15px", backgroundColor: "white", color: "black" }}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    endAdornment={
                        <InputAdornment position="end" style={{ marginRight: "15px" }}>
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </Row>
            <Row style={{display: "flex", justifyContent: "center"}}>
                <Button variant="contained" onClick={handleSubmit} style={{width:"70%", margin: "15px", height: "50px", borderRadius: "10px", backgroundColor: "black"}}>Login</Button>
            </Row>
            <Row style={{display: "flex", justifyContent: "center", paddingTop: "15px"}}>
                <h5 style={{color:"black"}}>Don't have an account?</h5>
                <a onClick={() => navigate("/register")} style={{cursor: "pointer", color:"white", textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', marginLeft: "10px", fontWeight: "500"}}>Sign Up</a>
            </Row>
        </Col>
        <Col sm="12" md="3" lg="3"> 
        </Col>
    </Row>
    </>
  )
}

export default Login;