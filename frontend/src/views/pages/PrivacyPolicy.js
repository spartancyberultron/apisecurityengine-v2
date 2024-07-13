import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilPhone, cilIndustry, cilFile, cilHouse, cilFlagAlt, cilListNumberedRtl, cilCalendar, cilDollar, cilMoney, cilLocationPin, cilBank, cibFacebook, cibTwitter, cibLinkedin } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const TermsAndConditions = () => {  

  const navigate = useNavigate();

  return (

      <div className="bg-secondary min-vh-100 d-flex flex-row align-items-center"
      >
        <CContainer>

            <h2>Terms and Conditions</h2>       

        </CContainer>
      </div>
  )
}

export default TermsAndConditions