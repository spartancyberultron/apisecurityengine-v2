import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/images/apisec_engine_logo.png'
import image from '../../../assets/images/apisec-banner.jpg'
import { useParams, useNavigate } from 'react-router-dom'
import bgImage from '../../../assets/images/landing-bg.jpg'


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
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import PasswordRecovery from './PasswordRecovery'

const PasswordRecoverySendOtp = () => {
  const navigate = useNavigate();
  const {role} = useParams();
  const showRole = () => {alert(role)}
  return (
    <div className="bg-secondary min-vh-100 d-flex flex-row align-items-center" style={{backgroundImage: `url(${bgImage})` }} >
      <CContainer>
        <CRow className="justify-content-center ">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4 border  border-end-0 bg-light">
                <CCardBody>
                  <CForm>
                    <h3 style={{  marginTop: '3rem' }}> Password Recovery</h3>
                    <CInputGroup className="mb-3 mt-3">
                      <CFormInput placeholder="Enter registered email" autoComplete="username" />
                    </CInputGroup>
                    
                    <CRow>
                      <CCol xs={6}>
                        <Link to={"/passwordrecovery"}> 
                        <CButton color="primary" className="px-3 " style={{ width: '23rem', background:"#5F259E"  }} >
                          Send OTP
                        </CButton>
                        </Link>
                      
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white border-3 border-start-0 " style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <img src={logo} style={{ width: '60%' }} />
                    <img src={image} style={{ width: '90%' }} />
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

export default PasswordRecoverySendOtp
