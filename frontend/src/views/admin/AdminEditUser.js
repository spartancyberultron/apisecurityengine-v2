import React, { useState, useEffect } from "react";
import { CFormInput, CButton, CInputGroup } from '@coreui/react';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminEditUser = () => {
  const [onLoading, setOnLoading] = useState(false);
  const [onSubmitting, setOnSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [logoURL, setLogoURL] = useState('');
  const [companyURL, setCompanyURL] = useState('');

  const [firstNameEmpty, setFirstNameEmpty] = useState(false);
  const [lastNameEmpty, setLastNameEmpty] = useState(false);
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [userId, setUserId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theUserId = urlParams.get('userId');

    setUserId(theUserId);
    loadUserDetails(theUserId);
  }, []);

  const loadUserDetails = async (theUserId) => {
    setOnLoading(true);

    const requestBody = { id: theUserId };
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      const response = await axios.post('api/v1/admin/loadUser', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      const userData = response.data;
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setEmail(userData.email);
      setOrganizationName(userData.organization.name);
      setLogoURL(userData.organization.logoURL);
      setCompanyURL(userData.organization.companyURL);

      setOnLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setOnLoading(false);
    }
  };

  const updateUser = async () => {
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

    if (password !== '' && !isValidPassword(password)) {
      setPasswordInvalid(true);
      allGood = false;
    } else {
      setPasswordInvalid(false);
    }

    if (allGood) {
      setOnSubmitting(true);

      const requestBody = {
        id: userId,
        firstName,
        lastName,
        email,
        password,
        organizationName,
        logoURL,
        companyURL
      };

      const bearerToken = localStorage.getItem('ASIToken');

      try {
        const response = await axios.post('api/v1/admin/updateUser', requestBody, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        });

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
          setOnSubmitting(false);
        } else {
          toast('Organization updated', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setOnSubmitting(false);
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
          <h2>Editing Organization</h2>
        </div>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Primary contact's First Name"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            style={{ width: '30%' }}
          />
          {firstNameEmpty && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter primary contact's first name</span>}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Primary contact's Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '30%' }}
          />
          {lastNameEmpty && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter primary contact's last name</span>}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Email"
            value={email}
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
          <span style={{color:'blue', fontSize:12}}>Leave the password field blank if you do not want to change password</span>
          {passwordInvalid && <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            The password must be at least 8 characters long and must contain one uppercase letter, one digit and one special
            character.
          </span>}
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Organization Name"
            onChange={(e) => setOrganizationName(e.target.value)}
            value={organizationName}
            style={{ width: '30%' }}
          />
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Logo URL"
            onChange={(e) => setLogoURL(e.target.value)}
            value={logoURL}
            style={{ width: '30%' }}
          />
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Company URL"
            onChange={(e) => setCompanyURL(e.target.value)}
            value={companyURL}
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
          onClick={updateUser}
        >
          {onSubmitting ? <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} /> : 'Update Organization'}
        </CButton>
      </div>
    </div>
  );
}

export default AdminEditUser;
