import React from 'react'
import { Link } from 'react-router-dom'
import bgImage from '../../../assets/images/landing-bg.jpg'
import logo from '../../../assets/images/apisec_engine_logo.png'
import image from '../../../assets/images/apisec-banner.jpg'

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

const PasswordRecovery = () => {
  return (
    <div className="bg-secondary min-vh-100 d-flex flex-row align-items-center" style={{backgroundImage: `url(${bgImage})` }} >
      <CContainer>
        <CRow className="justify-content-center ">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4  border-end-0 bg-light ">
                <CCardBody>
                  <CForm>
                    <h3 style={{ marginLeft: '0.8rem', marginTop: '3rem' }}> Password Recovery</h3>
                    <CRow className="mt-3 mb-3  justify-content-between">
                      <div style={{display:"flex", justifyContent:"space-around"}}>
                        <div><input style={{width:"2rem"}}/></div>
                        <div><input style={{width:"2rem"}}/></div>
                        <div><input style={{width:"2rem"}}/></div>
                        <div><input style={{width:"2rem"}}/></div>
                        <div><input style={{width:"2rem"}}/></div>
                        <div><input style={{width:"2rem"}}/></div>
                      </div>
                    </CRow>
                    <CRow>
                      <CCol xs={6}>
                        <Link to={"/passwordreset"}>
                        <CButton color="primary" className="px-3 " style={{ width: '21.3rem',marginLeft:'8%', background:"#5F259E"  }}>        
                          Submit OTP
                        </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white  " style={{ width: '44%', marginRight: '0.5rem' }}>
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

export default PasswordRecovery
