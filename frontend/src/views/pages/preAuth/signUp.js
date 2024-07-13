import React, { useState, } from 'react'
import { Link } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'
import logo from '../../../assets/images/apisec_engine_logo.png'
import image from '../../../assets/images/apisec-banner.jpg'
import bgImage from '../../../assets/images/apisec-banner.jpg'
import { useDispatch, useSelector } from 'react-redux'
import { loginData } from 'src/store/Layout/actions'
import showPassword from '../../../assets/images/show-password.png'
import hidePassword from '../../../assets/images/hide-password.png'
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

} from '@coreui/react'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios'

const SignUp = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  let { role } = useParams()

  const showRole = () => {
    alert(role)
  }

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false);

  const [isEmailOrPasswordEmpty, setIsEmailOrPasswordEmpty] = useState(false)
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false)
  const [isEmailInvalid, setIsEmailInvalid] = useState(false)
  const [isEmailOrPasswordIncorrect, setIsEmailOrPasswordIncorrect] = useState(false)
  const [showingPassword, setShowingPassword] = useState(false);

  const goToLogin = (e) => {

    e.preventDefault();
    navigate('/login')
  }

  const toggleShowPassword = () => {
    setShowingPassword(!showingPassword)
  }

  const goHome = (e) => {

    e.preventDefault();
    navigate('/')
  }


  function validateEmail(input) {

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (input.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  }


  const login = async () => {

    if(email.length == 0 || password.length == 0){
       setIsEmailOrPasswordEmpty(true);
    }else{

    if(email == 'user@apisecurityengine.com' && password == '123456'){

          setSubmitting(false);
          navigate('/user-dashboard') 
    }else{
      setSubmitting(false);
      setIsEmailOrPasswordIncorrect(true);
    }
  }

  }

  return (
    <div
      className="bg-secondary min-vh-100 d-flex flex-row align-items-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4 border  border-end-0 bg-light">
                <CCardBody>
                  <CForm style={{display:'flex', flexDirection:'column'}}>
                  <img src={logo} style={{ width: '40%', alignSelf:'center' }} alt="" />
                    
                    <h3 style={{ marginTop: '1rem', textAlign:'center' }}>Create an Account with <br/>APISecurityEngine</h3>
                   

                    <CInputGroup className="mb-4" style={{ flexDirection: 'column', marginTop:10}}>
                      <CFormInput
                        placeholder="First Name"
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="firstName"
                        style={{ width: '100%' }}
                      />
                      {isEmailInvalid &&
                        <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Invalid email</span>
                      }
                    </CInputGroup>

                    <CInputGroup className="mb-4" style={{ flexDirection: 'column', marginTop:0}}>
                      <CFormInput
                        placeholder="Last Name"
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="lastName"
                        style={{ width: '100%' }}
                      />
                      {isEmailInvalid &&
                        <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Invalid email</span>
                      }
                    </CInputGroup>

                    <CInputGroup className="mb-4" style={{ flexDirection: 'column', marginTop:0}}>
                      <CFormInput
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        style={{ width: '100%' }}
                      />
                      {isEmailInvalid &&
                        <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Invalid email</span>
                      }
                    </CInputGroup>

                    <CInputGroup className="mb-4" style={{ flexDirection: 'column', }}>
                      <CFormInput
                        type={showingPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-Password"
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <img src={!showingPassword ? showPassword : hidePassword} style={{
                        width: 30,
                        height: 30, position: 'absolute', right: 10, top: 5, zIndex: 1000
                      }}
                        onClick={toggleShowPassword} />
                      
                    </CInputGroup>

                     <CInputGroup className="mb-4" style={{ flexDirection: 'column', }}>

                      <CFormInput
                        type={showingPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        autoComplete="current-Password"
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <img src={!showingPassword ? showPassword : hidePassword} style={{
                        width: 30,
                        height: 30, position: 'absolute', right: 10, top: 5, zIndex: 1000
                      }}
                        onClick={toggleShowPassword} />
                      
                    </CInputGroup>

                    <CRow>
                      <CCol xs={60}>

                        <CButton
                          style={{
                            width: '100%', marginBottom: '2%', borderWidth: 0, fontSize: 20,
                            background: '#7366ff'
                          }}
                          color="primary"
                          className="px-3"                          
                        >
                          {submitting ?
                            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                            :
                            'Create Account'
                          }
                        </CButton>
                        

                        <a onClick={goToLogin} style={{ textDecoration: 'none', }} href="#">
                          <p style={{ color: '#2f2f3b', fontSize:14 }}>
                            Have an account? Login here.
                          </p>
                        </a>
                        

                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white border-3 border-start-0 " style={{ width: '44%', backgroundImage: `url(${image})`, backgroundSize:'cover'}}>

                <CCardBody className="text-center">
                  
                </CCardBody>

              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default SignUp;
 