import React, { Component, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import Login from './views/pages/preAuth/Login'
import SignUp from './views/pages/preAuth/signUp'

import AdminLogin from './views/pages/preAuth/AdminLogin'

import PasswordRecovery from './views/pages/preAuth/PasswordRecovery'
import LandingPage from './views/pages/preAuth/LandingPage'
import PasswordReset from './views/pages/preAuth/PasswordReset'
import PasswordRecoverySendOtp from './views/pages/preAuth/PasswordRecoverySendOtp'
import DefaultLayout from './layout/DefaultLayout'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Check if the current URL contains 'localhost'
if (window.location.hostname === 'localhost') {

  axios.defaults.baseURL = "http://localhost:5001";
  global.backendUrl = "http://localhost:5001";
} else {
  
  axios.defaults.baseURL = "https://apisecv2-backend.trikodev.xyz";
  global.backendUrl = "https://apisecv2-backend.trikodev.xyz";
}

if (window.location.hostname === 'localhost') {

  global.baseUrl = "http://localhost:3000";

} else {  
  
  global.baseUrl = "https://appnew.apisecurityengine.com";
}





//axios.defaults.baseURL = "https://apisecv2-backend.trikodev.xyz"
//global.backendUrl = "https://apisecv2-backend.trikodev.xyz"
global.reportAPIURL = "https://reports.apisecurityengine.com/api/v1/download/apisec-report-download/"

//axios.defaults.baseURL="http://localhost:5001"
//global.backendUrl = "http://localhost:5001"

//global.reportAPIURL = "http://localhost/apisec-reporting/apisec-reporting/public/api/v1/download/apisec-report-download/"


const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

class App extends Component {    

  render() {
    
    return (
        <BrowserRouter>
        
          <Routes>
            <Route path="/" name="Login" element={<Login/>} />
            <Route exact path="/login" name="Login" element={<Login />} />
            <Route exact path="/sign-up" name="Sign Up" element={<SignUp />} />
            <Route exact path="/password-recovery" name="Password Recovery" element={<PasswordRecovery/>} />
            <Route exact path="/password-recovery-send-otp" name="Password Recovery Send OTP" element={<PasswordRecoverySendOtp/>} />
            <Route exact path="/password-reset" name="Password Reset" element={<PasswordReset/>} />

            <Route exact path="/admin-login" name="Admin Login" element={<AdminLogin />} />

            <Route  path="*" name="dashboard" element={<DefaultLayout/>} />              
          </Routes>
          <ToastContainer />
        
        </BrowserRouter>    
    )
  }
}

export default App
