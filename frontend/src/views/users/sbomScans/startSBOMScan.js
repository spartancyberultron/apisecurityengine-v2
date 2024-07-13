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
  CFormLabel
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StartSBOMScan = () => {

  const navigate = useNavigate()

  const [scanName, setScanName] = useState("")
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false)

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const toaster = useRef();  

  function isExceeding8MB(file){

    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (fileSizeInMB > 8) {
      //console.log('File size exceeds 8MB');
      return true;
    } else {
      //console.log('File size is within 8MB limit');
      return false;
    }
    
  } 


  const startScan = () => {

    if (scanName === '') {

      setValidationFailed(true);
      setErrorText('Scan name is required.');

    } else if (file === null) {

      setValidationFailed(true);
      setErrorText('Please select a SBOM file');

    }else if((file !== null && (typeof file !=='undefined')) && isExceeding8MB(file)){

      setValidationFailed(true);
      setErrorText('The file size must not exceed 8MB. Please attach a smaller file');

    }else {

      setLoading(true)      

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('scanName', scanName);
      formData.append('file', file);

      // Make the API call
      fetch(global.backendUrl+'/api/v1/sbomScans/startSBOMScan', {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${bearerToken}`
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {

        // Handle the API response
        if(data.hasOwnProperty('error')){
           setValidationFailed(true);
           setErrorText(data.error);
           setLoading(false);
        }
        else if(data.hasOwnProperty('err')){
          setLoading(false);
          setValidationFailed(true);
          setErrorText("The file does not have a valid SBOM content, or the file is corrupt.");
          
       }else{

           setSubmissionSuccess(true);
           setLoading(false);

           toast('Scan completed', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
          });
    

           // Move to SBOM scans window in 1 second
           navigate('/sbom-scans')
        }

      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });


      const timer = setTimeout(() => {

         //setSubmissionSuccess();
         toast('Scan started', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
      });


       // Move to SBOM scans window in 1 second
       navigate('/sbom-scans')
      }, 10000);         

    }   

  } 


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const goBack = (e) => {

    e.preventDefault();
    navigate('/sbom-scans')
  }


  return (


    <div>

<div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

<span className="pageHeader">Start a SBOM Scan</span>
<CButton
    onClick={goBack}
    className="darkButton"                
    color="primary"
  >
    <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight:10 }} />
    Back to Scans List
  </CButton>
</div>


    <div className="theCards" style={{ display:'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX:'hidden' }}>

      <div style={{ width: '60%' }}>

        <div>
         

          <div  style={{  padding: 15 }}>

         
            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'#000'  }}>Scan Name<span style={{color:'red'}}>*</span></CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormInput
                placeholder="Scan Name"
                autoComplete="scanName"
                className="white-input"
                onChange={(e) => setScanName(e.target.value)}
                style={{ width: '100%' }}
              />


            </CInputGroup>                 



            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'#000' }}>Upload a SBOM file</CFormLabel><br/>
            <span style={{color:'blue', fontSize:13}}>Please upload only JSON documents</span><br/>

            <CInputGroup className="" style={{ flexDirection: 'column', }}>
              <CFormInput
                placeholder="Upload SBOM File"
                autoComplete="username"
                type="file" 
                className="white-input"
                size="sm"
                id="inputFile"
                accept="application/json, .json"
                onChange={handleFileChange}
                style={{ width: '100%' }}
              />


            {validationFailed &&

                <span style={{color:'red', paddingTop:15}}>{errorText}</span>
            }

            </CInputGroup>             
            
         


            <CButton
              style={{
                width: '100%',
                marginTop: '3%',
                marginBottom: '2%',
                borderWidth: 0,
                fontSize: 20,
                background: '#7367f0'
              }}
              color="primary"
              className="px-3"
              onClick={startScan}
            >              


              {loading ?
                            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                            :
                            'Start Scan'
                          }


            </CButton>

        {submissionSuccess &&
            <span style={{color:'green', fontSize:17}}>The scan is started.             
              <br/> <br/>
              Moving to scans list in 5 seconds...
            </span>
        }
          </div>


        </div>
      </div>



      <div style={{ width: '40%', display:'flex', justifyContent:'center', 
      flexDirection:'column',  }}>


<p style={{textAlign:'center', alignSelf:'center', width:'60%', fontSize:13}}>Please ensure the file you input,
 has valid JSON content, and are in proper SBOM format. 
</p>  

      </div>

    </div>

    </div>
  )
}

export default StartSBOMScan