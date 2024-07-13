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

const AddAPICollectionVersion = () => {

  const navigate = useNavigate()


  const [projectName, setProjectname] = useState("")
  const [email, setEmail] = useState("")
  const [collectionUrl, setCollectionUrl] = useState("")  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false)

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const toaster = useRef();


  function checkURLType(url) {

    try {
      new URL(url);
    } catch (error) {
      return false; // Invalid URL
    }
    
    const extension = url.split('.').pop().toLowerCase();
    
    if (extension === 'json') {
      return true; // Valid URL to a JSON file
    } else if (extension === 'yaml' || extension === 'yml') {
      return true; // Valid URL to a YAML file
    } else {
      return false; // Valid URL, but not a JSON or YAML file
    }
  }

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

    if (projectName === '') {

      setValidationFailed(true);
      setErrorText('Project name is required.');

    } else if (file === null && collectionUrl=='') {

      setValidationFailed(true);
      setErrorText('Please select an API collection file');

    }else if((file !== null && (typeof file !=='undefined')) && isExceeding8MB(file)){

      setValidationFailed(true);
      setErrorText('The file size must not exceed 8MB. Please attach a smaller file');

    }else if(collectionUrl!=='' && !checkURLType(collectionUrl)){

      setValidationFailed(true);
      setErrorText('Please enter a valid URL and ensure the URL is of a JSON or YAML file');

    }else if (email === '') {

      setValidationFailed(true);
      setErrorText('Email is required.');

    } else if (!isValidEmail(email)) {

      setValidationFailed(true);
      setErrorText('Please enter a valid email address.');

    } else {

      setLoading(true)      

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('projectName', projectName);
      formData.append('email', email);
      formData.append('file', file);
      formData.append('collectionUrl', collectionUrl);      

      // Make the API call
      fetch(global.backendUrl+'/api/v1/activeScans/startActiveScan', {
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
          setErrorText("The file does not have a valid Postman/Swagger collection content, or the file is corrupt.");
          
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
    

           // Move to active scans window in 1 second
           navigate('/active-scans')
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


       // Move to active scans window in 1 second
       navigate('/active-scans')
      }, 10000);         

    }   

  }

  const isValidEmail = (value) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(value);
  };


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const goBack = (e) => {

    e.preventDefault();
    navigate('/active-scans')
  }


  return (


    <div>

<div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

<span className="pageHeader">Start a Scan</span>
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

         
            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white'  }}>Project Name</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormInput
                placeholder="Project Name"
                autoComplete="projectName"
                className="white-input"
                onChange={(e) => setProjectname(e.target.value)}
                style={{ width: '100%' }}
              />


            </CInputGroup>

            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white' }}>Email to send the report to</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Email to send the report to"
                autoComplete="email"
                className="white-input"
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />

            </CInputGroup>            



            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white' }}>Upload a Postman/Swagger collection file</CFormLabel><br/>
            <span style={{color:'blue', fontSize:13}}>Please upload only JSON/YAML collections</span><br/>

            <CInputGroup className="" style={{ flexDirection: 'column', }}>
              <CFormInput
                placeholder="Upload Postman/Swagger Collection"
                autoComplete="username"
                type="file" 
                className="white-input"
                size="sm"
                id="inputFile"
                accept="application/json, application/x-yaml, .json, .yaml, .yml"
                onChange={handleFileChange}
                style={{ width: '100%' }}
              />


            {validationFailed &&

                <span style={{color:'red', paddingTop:15}}>{errorText}</span>
            }

            </CInputGroup>

            <p style={{marginTop:20}}>Or</p>

            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="URL to the API collection file"
                autoComplete="collectionUrl"
                className="white-input"
                onChange={(e) => setCollectionUrl(e.target.value)}
                style={{ width: '100%' }}
              />

            <span style={{color:'blue', fontSize:13}}>Must be a URL of a raw file containing a Postman/Swagger/OpenAPI collection</span><br/>

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
            After the scan is complete, the scan report is sent to the email mentioned. <br/>It will also be available 
              in the dashboard under Active Scans. You may leave this window now. 
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
 has valid JSON/YAML content, and are in proper Postman/Swagger/OpenAPI format. 
</p>



  <p style={{textAlign:'center', alignSelf:'center', width:'60%', marginTop:100, fontSize:13}}>Around one-third of the tests we run, 
  require the APIs to be called. 
  Please ensure the collection you upload, have the valid authentication tokens for the authenticated endpoints, 
  to allow us to check for all vulnerabilities we check for.</p>

      </div>

    </div>

    </div>
  )
}

export default AddAPICollectionVersion