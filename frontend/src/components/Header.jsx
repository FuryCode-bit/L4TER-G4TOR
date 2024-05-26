import React, { useState, useEffect } from 'react';
import logo from './../assets/logo.png';
import { useNavigate, useLocation } from "react-router-dom";

import api from '../utils/api';
import printError from '../utils/printErrorMessages';

import {Container, Row, Col} from 'reactstrap'

import Button from '@mui/material/Button';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [deviceType, setDeviceType] = useState('pc');
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

        const formattedDateTime = `${dateTime.toLocaleDateString('en-US', { weekday: 'long' })}, ${dateTime.getDate()} ${dateTime.toLocaleDateString('en-US', { month: 'long' })} ${dateTime.getFullYear()} ${dateTime.toLocaleTimeString()}`;

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width <= 768) {
                setDeviceType('mobile');
            } else if (width <= 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('pc');
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const paginas = [
        {
            label: "CHECK",
            href: "/",
        },
        {
            label: "HOME",
            href: "/home",
        },
        {
            label: "ENCRYPT",
            href: "/cifrar",
        },
        {
            label: "DECRYPT",
            href: "/decifrar",
        },
        {
            label: "Logout",
            href: "/login",
        },
    ];

    const getMenuTime = () => {
        const { pathname } = location;
        
        // Hide buttons on /register or /login pages
        if (pathname === '/register' || pathname === '/login') {
            return null;
        }

        return formattedDateTime;
    }

    const getMenuButtons = () => {
        const { pathname } = location;
        const token = localStorage.getItem("token");

        const paginasVerifica = [
            {
                label: "CHECK",
                href: "/",
            },
            {
                label: "LOGIN",
                href: "/login",
            },
            {
                label: "REGISTER",
                href: "/register",
            }
        ];
        
        // If the pathname is /register, /login, or / and the user is not logged in, display paginasVerifica
        const pagesToDisplay = (!token && (pathname === '/' || pathname === '/register' || pathname === '/login')) 
        ? paginasVerifica : paginas;

        return pagesToDisplay.map(({ label, href }) => (
            <Button
                key={href}
                onClick={() => {
                    if (label === "Logout") {
                        localStorage.removeItem("token"); // Remove JWT token from localStorage
                    }
                    navigate(href);
                    setMobileMenuOpen(false); // Close mobile menu after clicking a link
                }}
                aria-current={pathname === href ? "page" : undefined}
                style={{width: "100px", height: "25px", backgroundColor: "white", borderRadius: "10px", fontSize: "12px", marginLeft: "10px"}}
            >
                {label}
            </Button>
        ));
    };

    const displayDesktop = () => {
        return (
            <Row style={{height: "100px"}}>
                <Col sm="4" md="4" lg="4" style={{display: "flex", justifyContent: "center", alignItems: "center", color: "white"}}>
                    <h3>{getMenuTime()}</h3>
                </Col>

                <Col sm="4" md="4" lg="4" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <h2 style={{padding: "15px", backgroundColor: "#00800095", color: "white", fontWeight: "300"}}>SEE-U-L4TER</h2>
                </Col>

                <Col sm="4" md="4" lg="4" style={{display: "flex", alignItems: "center", marginLeft: "-150px"}}>
                    <ul style={{display: "flex", justifyContent: "space-evenly"}}>
                        {getMenuButtons()}
                    </ul>
                </Col>
            </Row>
        );
    }

    // const displayMobile = () => {
    //     return (
    //         <header>
    //             <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-900">
    //                 <div className="flex flex-wrap justify-between items-center mx-auto">
    //                     {/* Logo */}
    //                     <a href="http://localhost:3000" className="flex items-center w-1/3">
    //                         <img src={logo} className="h-20 object-contain" alt="Flowbite Logo" />
    //                     </a>
    //                     {/* Login Button */}
    //                     <div className="w-1/3 flex justify-center">
    //                         <button onClick={() => navigate("/login")} className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Log in</button>
    //                     </div>
    //                     {/* Hamburger Button */}
    //                     <div className="w-1/3 flex justify-end lg:order-2">
    //                         <button onClick={toggleMobileMenu} data-collapse-toggle="mobile-menu-2" data-target="mobile-menu-2" type="button" className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded={isMobileMenuOpen}>
    //                             <span className="sr-only">Open main menu</span>
    //                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
    //                         </button>
    //                     </div>
    //                     {/* Mobile Menu */}
    //                     <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} w-full lg:flex lg:w-auto lg:order-1`} id="mobile-menu-2">
    //                         <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
    //                             {getMenuButtons()}
    //                         </ul>
    //                     </div>
    //                 </div>
    //             </nav>
    //         </header>
    //     );
    // }

    return (
        <div>
            {deviceType === 'mobile' ? displayDesktop() : displayDesktop()}
        </div>
    )
}

export default Header;
