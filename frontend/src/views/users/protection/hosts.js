import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'


const Hosts = () => {

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
    
  
  const goToStartQuickScan = (e) => {

    e.preventDefault();
    navigate('/start-active-scan')
  }

   return (
    <div style={{ overflow: "scroll", position:'relative', overflowY: 'hidden',  }}>
    <div style={{ width:'100%'}}>
    <div>
      <div style={{ marginBottom: '2rem', display:'flex', flexDirection:'row', justifyContent:'space-between' }}>

        <h2>Hosts</h2>
        
      </div>

</div> 
    </div> 
    </div>     
   )
}

export default Hosts
            


