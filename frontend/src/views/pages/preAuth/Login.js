import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'
import lightLogo from '../../../assets/images/apisec-light-logo.png'
import image from '../../../assets/images/apisec-banner.jpg'
import bgImage from '../../../assets/images/apisec-banner.jpg'
import { useDispatch, useSelector } from 'react-redux'
import { loginData } from 'src/store/Layout/actions'

import showPassword from '../../../assets/images/show-password.png'
import hidePassword from '../../../assets/images/hide-password.png'

import { CircularProgress } from '@mui/material';

import loginImage from '../../../assets/images/auth-login-illustration-dark.png'

import securityBanner from '../../../assets/images/securitybanner.jpg'
import apiBanner from '../../../assets/images/apibanner.jpg'

import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";


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

const VendorLogin = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  let { role } = useParams()

  const showRole = () => {
    alert(role)
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false);

  const [checking, setChecking] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [isEmailOrPasswordEmpty, setIsEmailOrPasswordEmpty] = useState(false)
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false)
  const [isEmailInvalid, setIsEmailInvalid] = useState(false)
  const [isEmailOrPasswordIncorrect, setIsEmailOrPasswordIncorrect] = useState(false)
  const [showingPassword, setShowingPassword] = useState(false);
  

  const goToRegister = (e) => {

    e.preventDefault();
    navigate('/sign-up')
  }

  const toggleShowPassword = () => {
    setShowingPassword(!showingPassword)
  }

  const goHome = (e) => {

    e.preventDefault();
    navigate('/')
  }


  useEffect(() => {

    setChecking(true);
    // Check localStorage for user data
    const user = localStorage.getItem('ASIUser');
    if (user) {
      const parsedUser = JSON.parse(user);

      console.log('parsedUser:', parsedUser);

      const token =  localStorage.getItem('ASIToken')

      console.log('token:', token);



      if (parsedUser.userType === 'user') {
        //window.location.replace('/user-dashboard');
        setChecking(false);
        navigate('/user-dashboard')
      } else if (parsedUser.userType === 'admin') {
        setChecking(false);
        //window.location.replace('/admin-all-users');
        navigate('/admin-all-users')
      }
    }else{
      setChecking(false);
    }
  }, []);


  function validateEmail(input) {

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (input.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  }

  const handleKeyPress = (event) => {

    event.preventDefault()

    if (event.key === 'Enter') {
      login();
    }
  };


  const login = async () => {

    if (email.length == 0 || password.length == 0) {

        setIsError(true);
        setErrorMessage('Please enter email and password');

    } else if(!validateEmail(email)){

        setIsError(true);
        setErrorMessage('Please enter a valid email');

    } else {

      setSubmitting(true);

      const url = '/api/v1/users/userLogin';

      const data = {
        email: email,
        password: password,
      };

      axios.post(url, data)
        .then(response => {

          if (response.status === 200) {

            // Code to execute if the response status is 200 (OK)            
            if (response.data.data.user) {              
  
              // Save user data and token in localStorage
              localStorage.setItem('ASIUser', JSON.stringify(response.data.data.user))
              localStorage.setItem('ASIToken', response.data.data.token);
  
              setSubmitting(false);

              if(response.data.data.user.userType == 'user'){
                  //navigate('/user-dashboard');
                  window.location.replace('/user-dashboard');
              }else if(response.data.data.user.userType == 'admin'){
                  //navigate('/admin-all-users');
                  window.location.replace('/admin-all-users');
              }  
            }

          } else {

            // Code to execute if the response status is not 200
            setIsError(true);
            setErrorMessage('These credentials do not match our records')
          }
        })
        .catch(error => {


          if (error.response && error.response.status === 401) {

            // Code to execute if the response status is 401 (Unauthorized)
            setSubmitting(false);
            setIsError(true);
            setErrorMessage('These credentials do not match our records')

          } else {

            // Code to execute for other errors
            //console.error(error);
            setSubmitting(false);
            setIsError(true);
            setErrorMessage('Something went wrong. Please try again later')
          }
        });
      
  }

}
  return (
    <div
      className="min-vh-100 d-flex flex-row align-items-center"
      style={{  backgroundColor: '#fff' }}
    >

    {!checking ?

      <CContainer style={{  backgroundColor: '#fff' }}>

        <CRow className="justify-content-space-between">

        <CCol md={7}>


        <CCardGroup>

              <CCard className="p-4 border-end-0" style={{backgroundColor:'#f8f7fa', height:'80vh', borderWidth:0, marginLeft:50}}>
                
                <CCardBody style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>


                  <img src={apiBanner} style={{width:'40%', objectFit:'contain'}}/>
                  <img src={securityBanner} style={{width:'60%', objectFit:'contain'}}/>


                </CCardBody>

              </CCard>
          </CCardGroup> 

        </CCol>

        <CCol md={5}>

            <CCardGroup style={{height:'100%', width:'100%'}}>
              <CCard style={{backgroundColor:'transparent', borderWidth:0,height:'100%', width:'100%'}}>

                <CCardBody style={{display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center', 
                 height:'100%', width:'100%'}}>

                  <CForm style={{ display: 'flex', flexDirection: 'column', width:'60%'  }}>

                    <img src={lightLogo} style={{ width: 150, alignSelf: 'flex-start' }} alt="" />
                    
                    <span className="login-page-card-heading" style={{ marginTop: '1rem', textAlign: 'left', color:'rgb(93, 89, 108)', 
                     fontSize:26, fontWeight:500, }}>
                        Welcome to APISecurityEngine
                    </span>

                    <span  style={{  textAlign: 'left', color:'rgb(111, 107, 125)', 
                     fontSize:15, fontWeight:400, }}>
                        Login to Your Account
                    </span>

                    <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
                      <label style={{color:'rgb(93, 89, 108)', fontSize:13, fontWeight:400, marginBottom:5}}>Email Address</label>
                      <CFormInput
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyUp={handleKeyPress}
                        autoComplete="username"
                        className="blackText"
                        style={{ width: '100%' }}
                      />
                      {isEmailInvalid &&
                        <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Invalid email</span>
                      }
                    </CInputGroup>
                    <CInputGroup className="mb-4" style={{ flexDirection: 'column', }}>
                      <label style={{color:'rgb(93, 89, 108)', fontSize:13, fontWeight:400, marginBottom:5}}>Password</label>
                      <CFormInput
                        type={showingPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-Password"
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={handleKeyPress}
                        className="blackText"
                        style={{ width: '100%' }}
                      />

                      {showingPassword ?

                          <FaRegEye  onClick={toggleShowPassword} style={{
                            width: 25,
                            height: 25, position: 'absolute', right: 10, top: 30, zIndex: 1000
                          }}/>
                      :

                          <FaRegEyeSlash  onClick={toggleShowPassword} style={{
                            width: 25,
                            height: 25, position: 'absolute', right: 10, top: 30, zIndex: 1000
                          }}/>
                      }                    

                        
                        {isError &&
                           <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{errorMessage}</span> 
                        }                     
                      
                    </CInputGroup>

                    <div style={{width:'100%', display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>

                    <input type="checkbox" id="rememberMe" style={{width:15, backgroundColor:'#fff', border:'2px solid #dbdade'}}/>
                    <label for="rememberMe" style={{marginLeft:10, fontSize:15, fontWeight:400, color:'rgb(111, 107, 125)'}}>Remember Me</label>

                    </div>

                    
                    <CRow>
                      <CCol xs={60}>

                        <CButton
                          style={{
                            width: '100%', marginBottom: '2%', borderWidth: 0, fontSize: 15, fontWeight:500,marginTop:20,
                            background: '#7367f0', borderColor:'#7367f0', boxShadow:'0px 2px 4px rgba(15,20,34,.4)'
                          }}
                          color="primary"
                          className="px-3 "
                          onClick={() => {
                            login()
                          }}
                        >
                          {submitting ?
                            <CircularProgress color="primary" size={20} style={{ marginTop: 10, color: '#fff' }} />
                            :
                            'Login'
                          }
                        </CButton>

                        <Link to={'/#'} style={{ textDecoration: 'none', display:'none' }}>
                          <p style={{ color: '#2f2f3b', fontSize: 14 }}>Forgot password ?</p>
                        </Link>
                        

                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>

              </CCard>
              
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>

      :

      <>
      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <CircularProgress color="primary" size={100} style={{ marginTop: 10, color: '#000' }} />
      </div>
      </>
                        }
    </div>
  )
}

export default VendorLogin;
