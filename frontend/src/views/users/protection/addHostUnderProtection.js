import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster, CInputGroup } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddHostUnderProtection = () => {


  const [onSubmitting, setOnSubmitting] = useState(false);

  const [hostName, setHostName] = useState('')  
  const [hostIP, setHostIP] = useState('')  
  const [hostPort, setHostPort] = useState('')  
  const [hostDomain, setHostDomain] = useState('')  
  const [proxyDomain, setProxyDomain] = useState('')  

  const [hostNameEmpty, setHostNameEmpty] = useState(false)  
  const [hostIPEmpty, setHostIPEmpty] = useState(false) 
  const [hostPortEmpty, setHostPortEmpty] = useState(false) 
  const [hostDomainEmpty, setHostDomainEmpty] = useState(false)  
  const [proxyDomainEmpty, setProxyDomainEmpty] = useState(false)  

  const navigate = useNavigate()

  // Function to call the API endpoint
  const addHost = async () => {

    var allGood = true;
    
    // Check if any validation errors exist
    if (hostName === '') {

      setHostNameEmpty(true);
      allGood = false;

    }else{
        setHostNameEmpty(false);
    }   

    if (hostIP === '') {

      setHostIPEmpty(true);
      allGood = false;

    }else{
        setHostIPEmpty(false);
    }   

    if (hostPort === '') {

      setHostPortEmpty(true);
      allGood = false;

    }else{
        setHostPortEmpty(false);
    }  
    
    
    if (hostDomain === '') {

      setHostDomainEmpty(true);
      allGood = false;

    }else{
        setHostDomainEmpty(false);
    }   

    if (proxyDomain === '') {

      setProxyDomainEmpty(true);
      allGood = false;

    }else{
        setProxyDomainEmpty(false);
    }  


    if(allGood){


    setOnSubmitting(true)

    // Construct the request body
    const requestBody = {
      hostName, 
      hostIP,
      hostPort,
      hostDomain,    
      proxyDomain,
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/users/addProtectionHost', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response
      setOnSubmitting(false);


      if (response.data.hasOwnProperty('error')) {

        toast.error(response.data.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        setOnSubmitting(false);

      } else {

      toast('Host added', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setOnSubmitting(false);
      navigate('/hosts-under-protection');
    }


    } catch (error) {
      // Handle API error
      console.error('Error:', error);
      setOnSubmitting(false)
    }

  }

  };
  


  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>
      <div>
        <div style={{ marginBottom: '2rem', }}>
          <h2>Adding Host</h2>
        </div>


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Host Name"
            onChange={(e) => setHostName(e.target.value)}
            className="white-input"
            style={{ width: '30%' }}
          />
          {hostNameEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter host name</span>
          }
        </CInputGroup>  


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Host IP"
            onChange={(e) => setHostIP(e.target.value)}
            style={{ width: '30%' }}
            className="white-input"
          />
          {hostIPEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter host IP</span>
          }
        </CInputGroup>       


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Host Port"
            onChange={(e) => setHostPort(e.target.value)}
            style={{ width: '30%' }}
            className="white-input"
          />
          {hostPortEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter host port</span>
          }
        </CInputGroup>  


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Actual Domain"
            onChange={(e) => setHostDomain(e.target.value)}
            style={{ width: '30%' }}
            className="white-input"
          />
          {hostDomainEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter actual domain</span>
          }
        </CInputGroup>  

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Proxy Domain"
            onChange={(e) => setProxyDomain(e.target.value)}
            style={{ width: '30%' }}
            className="white-input"
          />
          {proxyDomainEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter proxy domain</span>
          }
        </CInputGroup>  

       

        <CButton
          style={{
            width: '30%', marginBottom: '2%', borderWidth: 0, fontSize: 17,
            background: '#7367f0'
          }}
          color="primary"
          className="px-3 "
          onClick={() => {
            addHost()
          }}
        >
          {onSubmitting ?
            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
            :
            'SAVE HOST'
          }
        </CButton>


      </div>
    </div>
  )
}

export default AddHostUnderProtection