import React, { Component } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './scss/style.scss';
import Login from './views/pages/preAuth/Login';
import AdminLogin from './views/pages/preAuth/AdminLogin';
import PasswordRecovery from './views/pages/preAuth/PasswordRecovery';
import PasswordReset from './views/pages/preAuth/PasswordReset';
import PasswordRecoverySendOtp from './views/pages/preAuth/PasswordRecoverySendOtp';
import DefaultLayout from './layout/DefaultLayout';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set base URLs
if (window.location.hostname === 'localhost') {
  axios.defaults.baseURL = "http://localhost:5001";
  global.backendUrl = "http://localhost:5001";
  global.baseUrl = "http://localhost:3000";
} else {
  axios.defaults.baseURL = "https://backend-new.apisecurityengine.com";
  global.backendUrl = "https://backend-new.apisecurityengine.com";
  global.baseUrl = "https://appnew.apisecurityengine.com";
}

global.reportAPIURL = "https://reports.apisecurityengine.com/api/v1/download/apisec-report-download/";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

class App extends Component {
  // Function to check if user is authenticated
  isAuthenticated = () => {
    return !!localStorage.getItem('ASIUser');
  };

  // Protected Route Component
  ProtectedRoute = ({ element }) => {
    return this.isAuthenticated() ? element : <Navigate to="/" />;
  };

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" name="Login" element={<Login />} />
          <Route exact path="/login" name="Login" element={<Login />} />
          <Route exact path="/password-recovery" name="Password Recovery" element={<PasswordRecovery />} />
          <Route exact path="/password-recovery-send-otp" name="Password Recovery Send OTP" element={<PasswordRecoverySendOtp />} />
          <Route exact path="/password-reset" name="Password Reset" element={<PasswordReset />} />
          <Route exact path="/admin-login" name="Admin Login" element={<AdminLogin />} />
          
          {/* Protect routes inside DefaultLayout */}
          <Route path="*" element={<this.ProtectedRoute element={<DefaultLayout />} />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    );
  }
}

export default App;
