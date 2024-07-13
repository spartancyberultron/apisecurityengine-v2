import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import { CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ddos from '../../../assets/images/ddos-protection.png'


const Settings = () => {

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState([])
  const [onLoading, setOnLoading] = useState(false);
  const [currentlySelectedJob, setCurrentlySelectedJob] = useState(null)

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
   )         
    
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
  const goToAddHost = (e) => {

    e.preventDefault();
    navigate('/add-host-under-protection')
  }

   return (

    
    <div style={{ overflow: "scroll", position:'relative', overflowY: 'hidden',  }}>
    <div style={{ width:'100%'}}>
    <div>
      <div style={{ marginBottom: '2rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

        <h2 style={{color:'#7366ff', fontWeight:'bold'}}>Settings</h2>
        <hr/>

<div style={{display:'flex', flexDirection:'row'}}>

        <div style={{width:'60%'}}>  


            
        </div>

        

  </div>    

  
        
      </div>

</div> 
    </div> 
    </div>     
   )
}

export default Settings
            


