import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster, CInputGroup } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminEditUser = () => {


  const [onLoading, setOnLoading] = useState(false);
  const [onSubmitting, setOnSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [firstNameEmpty, setFirstNameEmpty] = useState(false)
  const [lastNameEmpty, setLastNameEmpty] = useState(false)
  const [emailEmpty, setEmailEmpty] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [passwordEmpty, setPasswordEmpty] = useState(false)
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [userId, setUserId] = useState('')


  const navigate = useNavigate()
  

  useEffect(() => {
   
      var arr = window.location.search.split('=');
      var theUserId = arr[1];
  
      setUserId(theUserId)
      loadUserDetails(theUserId);
      
  
  }, []);


  const loadUserDetails = async (theUserId) => {


    setOnLoading(true);

    // Construct the request body
    const requestBody = {     
      id:theUserId
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/admin/loadUser', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response      

      setFirstName(response.data.firstName);
      setLastName(response.data.lastName);
      setEmail(response.data.email);

      setOnLoading(false);

    } catch (error) {
      // Handle API error
      console.error('Error:', error);
      setOnLoading(false)
    }

  }

  // Function to call the API endpoint
  const updateUser = async () => {

    var allGood = true;
    
    // Check if any validation errors exist
    if (firstName === '') {
      setFirstNameEmpty(true);
      allGood = false;
    }else{
      setFirstNameEmpty(false);
    }

    if (lastName === '') {
      setLastNameEmpty(true);
      allGood = false;
    }else{
      setLastNameEmpty(false);
    }

    if (email === '') {
      setEmailEmpty(true);
      allGood = false;
    }else{
      setEmailEmpty(false);
    }

    if (email!== ''  && !isValidEmail(email)) {
      setEmailInvalid(true);
      allGood = false;
    }else{
      setEmailInvalid(false);
    }

  

    if (password !=='' && !isValidPassword(password)) {
      setPasswordInvalid(true);
      allGood = false;
    }else{
      setPasswordInvalid(false);
    }


    if(allGood){


   // var user = JSON.parse(localStorage.getItem('ASIUser'));

    setOnSubmitting(true)

    // Construct the request body
    const requestBody = {
      firstName,
      lastName,
      email,
      password,
      id:userId
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/admin/updateUser', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response

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


        toast('User updated', {
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
      // Handle API error
      console.error('Error:', error);
      setOnSubmitting(false)
    }


  }


  };

  // Function to validate email using regex
  const isValidEmail = (email) => {
    // Email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Function to validate password
  const isValidPassword = (password) => {
    // Password regex pattern
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };



  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>
      <div>
        <div style={{ marginBottom: '2rem', }}>
          <h2>Editing User</h2>
        </div>


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            style={{ width: '30%' }}
          />
          {firstNameEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter first name</span>
          }
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '30%' }}
          />
          {lastNameEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter last name</span>
          }
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '30%' }}
          />
          {emailEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter email</span>
          }
          {emailInvalid &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter a valid email</span>
          }
        </CInputGroup>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            className="blackText"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '30%' }}
          />
          
          {passwordInvalid &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
              The password must be at least 8 characters long and must contain one uppercase letter, one digit and one special
              character.</span>
          }
        </CInputGroup>

        <CButton
          style={{
            width: '30%', marginBottom: '2%', borderWidth: 0, fontSize: 20,
            background: 'linear-gradient(to right, #241c98, #00bdc1)'
          }}
          color="primary"
          className="px-3 "
          onClick={() => {
            updateUser()
          }}
        >
          {onSubmitting ?
            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
            :
            'UPDATE USER'
          }
        </CButton>


      </div>
    </div>
  )
}

export default AdminEditUser