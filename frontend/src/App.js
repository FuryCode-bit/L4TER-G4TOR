import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container } from 'reactstrap';
import './App.css';

import Login from './pages/Login';
import Register from "./pages/Register";
import Main from "./pages/Main";
import Cifrar from "./pages/Cifrar";
import Decifrar from "./pages/Decifrar";
import Verifica from "./pages/Verifica";

import ProtectedRoute from "./pages/ProtectedRoute";
import bg from "./assets/bg.png";
// video in https://www.youtube.com/watch?v=jPZEGEuBK1Y

function App() {
  const [debug, setDebug] = useState(false);

  return (
    <Container
      fluid
      className="p-0"
      id="mainContainer"
      style={{
        border: debug ? "3px solid red" : "none",
        overflowX: "hidden",
        height: '100vh'
      }}>
      <div className="overlay">
        {debug && <h3>Debug Mode</h3>}
      </div>
      <BrowserRouter>
        <img src={bg} style={{overflow: "hidden", zIndex: "-99" }} />
        <div className="contentVideo">
          <Routes>
            <Route element={<ProtectedRoute />}>
              {/* Rota segura */}
              <Route path="/home" element={<Main />} />
              <Route path="/cifrar" element={<Cifrar />} />
              <Route path="/decifrar" element={<Decifrar />} />
            </Route>
            <Route path="/" element={<Verifica />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Verifica />} /> {/* Redirect to login for unknown routes */}
          </Routes>
        </div>
      </BrowserRouter>
    </Container>
  );
}

export default App;
