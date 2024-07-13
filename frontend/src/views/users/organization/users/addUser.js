import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CRow,
  CFormLabel,
  CFormSelect,
  CTextarea
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';


const AddUser = () => {

  const navigate = useNavigate()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [collectionUrl, setCollectionUrl] = useState("")
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false)

  const [userType, setUserType] = useState('user')
  const [theStatus, setTheStatus] = useState('Active')

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const toaster = useRef();

  const statuses = ['Active', 'Suspended']  
  

  const addUser = () => {

    if (firstName === '') {

      setValidationFailed(true);
      setErrorText('First name is required.');

    } else if (lastName === '') {

      setValidationFailed(true);
      setErrorText('Last name is required.');

    }if (email === '') {

      setValidationFailed(true);
      setErrorText('Email is required.');

    }if (phoneNumber === '') {

      setValidationFailed(true);
      setErrorText('Phone number is required.');

    } else {


      setLoading(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);      
      formData.append('status', theStatus);       

      const requestData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        status:theStatus     
    };


      // Make the API call
      fetch(global.backendUrl + '/api/v1/organizations/addUser', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(response => response.json())
        .then(data => {

          // Handle the API response

          if (data.hasOwnProperty('error')) {
            setValidationFailed(true);
            setErrorText(data.error);
            setLoading(false);
          }
          else if (data.hasOwnProperty('err')) {
            setLoading(false);
            setValidationFailed(true);
            setErrorText("Something went wrong. Please try again");

          } else {

            setSubmissionSuccess(true);
            setLoading(false);

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


            navigate('/users')
          }

        })
        .catch(error => {
          // Handle any errors
          console.error(error);
        });      

    }

  }



  const goBack = (e) => {

    e.preventDefault();
    navigate('/users')
  }


  return (
    <div style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <div style={{ width: '60%' }}>
        <div>
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2 className="pageHeader">Add User</h2>
            <CButton
              onClick={goBack}
              style={{
                width: 300,
                marginBottom: '2%',
                marginRight: 20,
                borderWidth: 0,
                fontSize: 15,
                borderColor: '#000',
                borderWidth: 1,
                color: '#000',
                background: 'transparent'
              }}
              color="primary"
              className="px-3"
            >
              <IoMdArrowRoundBack size={20} style={{ color: '#000', marginRight: 10 }} />
              Back to Users
            </CButton>
          </div>


          <div style={{ width: '100%', backgroundColor: '#fff', padding: 15 }}>


            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>First Name</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="First Name"
                autoComplete="firstName"
                className="white-input"
                onChange={(e) => setFirstName(e.target.value)}
                style={{ width: '100%' }}
              />


            </CInputGroup>

            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Last Name</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Last Name"
                autoComplete="lastName"
                className="white-input"
                onChange={(e) => setLastName(e.target.value)}
                style={{ width: '100%' }}
              />


            </CInputGroup>


            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Email</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Email"
                autoComplete="email"
                className="white-input"
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />


            </CInputGroup>


            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Phone Number</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Phone Number"
                autoComplete="phoneNumber"
                className="white-input"
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: '100%' }}
              />


            </CInputGroup>              



            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Status</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormSelect
                id="status"
                className="white-input"
                onChange={(e) => setTheStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>



            <CButton
              style={{marginTop:30, width:'100%'}}              
              color="primary"
              className="primaryButton"
              onClick={addUser}
              disabled={loading}
            >


              {loading ?
                <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                :
                'Save User'
              }


            </CButton>


          </div>


        </div>
      </div>

    </div>
  )
}

export default AddUser



