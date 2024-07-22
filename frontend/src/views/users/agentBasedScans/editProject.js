import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster, CInputGroup } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProject = () => {


  const [onLoading, setOnLoading] = useState(false);
  const [onSubmitting, setOnSubmitting] = useState(false);
  const [projectName, setProjectName] = useState('')  
  const [projectIntegrationID, setProjectIntegrationID] = useState('')  
  const [agentType, setAgentType] = useState('')  
  const [agentStatus, setAgentStatus] = useState('')  

  const [projectNameEmpty, setProjectNameEmpty] = useState(false)
  
  const [projectId, setProjectId] = useState('')

  const navigate = useNavigate()  

  useEffect(() => {
   
      var arr = window.location.search.split('=');
      var theProjectId = arr[1];
  
      setProjectId(theProjectId)
      loadProjectDetails(theProjectId);      
  
  }, []);


  const loadProjectDetails = async (theProjectId) => {


    setOnLoading(true);

    // Construct the request body
    const requestBody = {     
      id:theProjectId
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/users/loadProject', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response      

      setProjectName(response.data.projectName);
      setProjectIntegrationID(response.data.projectIntegrationID);
      setAgentType(response.data.agentType);
      setAgentStatus(response.data.agentStatus);

      setOnLoading(false);

    } catch (error) {
      // Handle API error
      console.error('Error:', error);
      setOnLoading(false)
    }

  }

  // Function to call the API endpoint
  const updateProject = async () => {

    var allGood = true;
    
    // Check if any validation errors exist
    if (projectName === '') {
      setProjectNameEmpty(true);
      allGood = false;
    }else{
      setProjectNameEmpty(false);
    }


    if(allGood){


    setOnSubmitting(true)

    // Construct the request body
    const requestBody = {
      projectName,     
      id:projectId
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/users/updateProject', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response

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


        toast('Application updated', {
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
        navigate('/agents');
      }

      

    } catch (error) {
      // Handle API error
      console.error('Error:', error);
      setOnSubmitting(false)
    }


  }


  };

  // Function to validate email using regex
  const isValidEmail = (email) => {
    // Email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Function to validate password
  const isValidPassword = (password) => {
    // Password regex pattern
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };



  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>
      <div>
        <div style={{ marginBottom: '2rem', }}>
          <h2>Editing Application</h2>
        </div>


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Application Name"
            onChange={(e) => setProjectName(e.target.value)}
            value={projectName}
            className="white-input"
            style={{ width: '30%', color:'black' }}
          />
          {projectNameEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter application name</span>
          }
        </CInputGroup>       

      

        <CButton
          style={{
            width: '30%', marginBottom: '2%', borderWidth: 0, fontSize: 20,
            background: '#7367f0'
          }}
          color="primary"
          className="px-3 "
          onClick={() => {
            updateProject()
          }}
        >
          {onSubmitting ?
            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
            :
            'UPDATE APPLICATION'
          }
        </CButton>


      </div>
    </div>
  )
}

export default EditProject