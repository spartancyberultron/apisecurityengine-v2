import React, { useState } from "react";
import { CFormInput, CButton, CInputGroup } from '@coreui/react';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminAddUser = () => {
  
  const [onSubmitting, setOnSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [logoURL, setLogoURL] = useState('');

  const [firstNameEmpty, setFirstNameEmpty] = useState(false);
  const [lastNameEmpty, setLastNameEmpty] = useState(false);
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const navigate = useNavigate();

  const addUser = async () => {
    let allGood = true;

    if (firstName === '') {
      setFirstNameEmpty(true);
      allGood = false;
    } else {
      setFirstNameEmpty(false);
    }

    if (lastName === '') {
      setLastNameEmpty(true);
      allGood = false;
    } else {
      setLastNameEmpty(false);
    }

    if (email === '') {
      setEmailEmpty(true);
      allGood = false;
    } else {
      setEmailEmpty(false);
    }

    if (email !== '' && !isValidEmail(email)) {
      setEmailInvalid(true);
      allGood = false;
    } else {
      setEmailInvalid(false);
    }

    if (password === '') {
      setPasswordEmpty(true);
      allGood = false;
    } else {
      setPasswordEmpty(false);
    }

    if (password !== '' && !isValidPassword(password)) {
      setPasswordInvalid(true);
      allGood = false;
    } else {
      setPasswordInvalid(false);
    }

    if (allGood) {
      setOnSubmitting(true);

      const requestBody = {
        firstName,
        lastName,
        email,
        password,
        organizationName,
        logoURL,
      };

      const bearerToken = localStorage.getItem('ASIToken');

      try {
        const response = await axios.post('/api/v1/admin/addUser', requestBody, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        });

        setOnSubmitting(false);

        if (response.data.hasOwnProperty('error')) {
          toast.error(response.data.error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });

        } else {
          toast('User added', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });

          navigate('/admin-all-users');
        }

      } catch (error) {
        console.error('Error:', error);
        setOnSubmitting(false);
      }
    }
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const isValidPassword = (password) => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden' }}>
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h2>Adding User</h2>
        </div>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: '30%' }}
          />
          {firstNameEmpty && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter first name</span>}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '30%' }}
          />
          {lastNameEmpty && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter last name</span>}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '30%' }}
          />
          {emailEmpty && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter email</span>}
          {emailInvalid && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter a valid email</span>}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '30%' }}
          />
          {passwordEmpty && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter password</span>}
          {passwordInvalid && (
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
              The password must be at least 8 characters long and must contain one uppercase letter, one digit, and one special character.
            </span>
          )}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Organization Name"
            onChange={(e) => setOrganizationName(e.target.value)}
            style={{ width: '30%' }}
          />
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Logo URL"
            onChange={(e) => setLogoURL(e.target.value)}
            style={{ width: '30%' }}
          />
        </CInputGroup>

        <CButton
          style={{
            width: '30%', marginBottom: '2%', borderWidth: 0, fontSize: 20,
            background: '#5141e0'
          }}
          color="primary"
          className="px-3"
          onClick={addUser}
        >
          {onSubmitting ? <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} /> : 'SAVE USER'}
        </CButton>
      </div>
    </div>
  );
};

export default AdminAddUser;