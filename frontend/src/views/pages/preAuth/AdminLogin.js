import React, { useState, } from 'react'
import { Link } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'
import bgImage from '../../../assets/images/landing-bg.jpg'
import { useDispatch, useSelector } from 'react-redux'
import logo from '../../../assets/images/apisec_engine_logo.png'
import image from '../../../assets/images/apisec-banner.jpg'
import { loginData } from 'src/store/Layout/actions'

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

import axios from 'axios'

const AdminLogin = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  let { role } = useParams()

  const showRole = () => {
    alert(role)
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')  

  const [isEmailOrPasswordEmpty, setIsEmailOrPasswordEmpty] = useState(false)  
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false)  
  const [isEmailInvalid, setIsEmailInvalid] = useState(false)  

  const store = useSelector((store) => store.loginInfo.loginInfo) 

  function validateEmail(input) {

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  
    if (input.match(validRegex)) {       
      return true;  
    } else {  
      return false;  
    }  
  }
  
  const login = async () => {

    // Apply validations
    if(email.length == 0 || password.length == 0){

       setIsEmailOrPasswordEmpty(true);

    }else if(!validateEmail(email)){
       setIsEmailOrPasswordEmpty(false);
       setIsEmailInvalid(true);

    }else{

      setIsEmailOrPasswordEmpty(false);
      setIsEmailInvalid(false);      

      const data = {
         email: email,
         password: password,
       }

       await axios
         .post(process.env.REACT_APP_API_BASE_URL + '/api/v1/users/login', data)
         .then((res) => {

          localStorage.setItem(
            'user',
            JSON.stringify({
              user: res.data.user,
              access_token: res.data.token
            }),
          )
          dispatch(loginData({
            user: res.data.admin,
            access_token: res.data.token
          }))

          navigate('/admin-dashboard') // admin dashboard
        
      })
      .catch((error) => {
       // console.log('error', error)
      })

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
                  <CForm>
                    <h3 style={{ marginTop: '3rem' }}>Admin Login</h3>
                    <CInputGroup className="mb-3 mt-3" style={{flexDirection:'column', }}>
                      <CFormInput
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        style={{width:'100%'}}
                      />
                      {isEmailInvalid &&
                         <span style={{color:'red', fontSize:12, marginTop:5}}>Invalid email</span>
                      }
                    </CInputGroup>
                    <CInputGroup className="mb-4" style={{flexDirection:'column', }}>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-Password"
                        onChange={(e) => setPassword(e.target.value)}
                        style={{width:'100%'}}
                      />
                      {isEmailOrPasswordEmpty &&
                         <span style={{color:'red', fontSize:12, marginTop:5}}>Please enter registered email and password</span>
                      }
                    </CInputGroup>
                    <CRow>
                      <CCol xs={60}>

                        <CButton
                          style={{
                            width: '100%', marginBottom: '2%', borderWidth: 0, fontSize: 20,
                            background: 'linear-gradient(90deg, rgb(86, 57, 139) 0%, rgb(95, 165, 204) 100%)'
                          }}
                          color="primary"
                          className="px-3 "
                          onClick={() => {
                            login()
                          }}
                        >
                          Login
                        </CButton>

                        <Link to={'/#'} style={{ textDecoration: 'none' }}>
                          <p style={{ color: '#5F259E' }}>Forgot password ?</p>
                        </Link>
                        
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white border-3 border-start-0 " style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <img src={logo} style={{ width: '40%' }} alt="" />
                    <img src={image} style={{ width: '90%' }} alt="" />
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default AdminLogin;
