import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom'

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
  CFormLabel,
  CFormSelect,
  CTextarea
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ShimmerTable } from "react-shimmer-effects";


const EditWorkspace = () => {

  const navigate = useNavigate()
  const location = useLocation();

  const [workspaceName, setWorkspaceName] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [workspace, setWorkspace] = useState([])
  const [workspaceId, setWorkspaceId] = useState('')

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


  useEffect(() => {

    window.scrollTo(0, 0);

    //setOnLoading(true);

    var arr = location.search.split('=');

    var theWorkspaceId = arr[1];

    setWorkspaceId(theWorkspaceId);

    loadWorkspaceDetails(theWorkspaceId);

  }, []);
  

 


  const loadWorkspaceDetails = async (theWorkspaceId) => {


    setLoading(true);

    const data = {
        workspaceId: theWorkspaceId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get('api/v1/organizations/getWorkspaceDetails/'+theWorkspaceId, {
      headers: { Authorization: `Bearer ${token}` },
    });


    setWorkspace(response.data.data);
    setWorkspaceName(response.data.data.name)  

    setLoading(false);

  };


  const editWorkspace = () => {

    if (workspaceName === '') {

      setValidationFailed(true);
      setErrorText('Name is required.');

    } else {


      setSubmitting(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('name', workspaceName);    

     
      const requestData = {
        id:workspace._id,
        name:workspaceName,       
    };


      // Make the API call
      fetch(global.backendUrl + '/api/v1/organizations/editWorkspace', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(response => response.json())
        .then(data => {

          // Handle the API response

          if (data.hasOwnProperty('error')) {
            setValidationFailed(true);
            setErrorText(data.error);
            setSubmitting(false);
          }
          else if (data.hasOwnProperty('err')) {
            setSubmitting(false);
            setValidationFailed(true);
            setErrorText("Something went wrong. Please try again");

          } else {

            setSubmissionSuccess(true);
            setSubmitting(false);

            toast('Workspace updated', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });


            navigate('/workspaces')
          }

        })
        .catch(error => {
          // Handle any errors
          console.error(error);
        });      

    }

  }



  const goBack = (e) => {

    e.preventDefault();
    navigate('/workspaces')
  }


  return (
    <div style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <div style={{ width: '60%' }}>
        <div>
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2 className="pageHeader">Editing Workspace</h2>
            <CButton
              onClick={goBack}
              style={{
                width: 300,
                marginBottom: '2%',
                marginRight: 20,
                borderWidth: 0,
                fontSize: 15,
                borderColor: '#000',
                borderWidth: 1,
                color: '#000',
                background: 'transparent'
              }}
              color="primary"
              className="px-3"
            >
              <IoMdArrowRoundBack size={20} style={{ color: '#000', marginRight: 10 }} />
              Back to Workspaces
            </CButton>
          </div>

          {loading ?
            <ShimmerTable row={8} col={10} />
          :

          <div style={{ width: '100%', backgroundColor: '#fff', padding: 15 }}>

            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Workspace Name</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Workspace Name"
                autoComplete="workspaceName"
                className="white-input"
                onChange={(e) => setWorkspaceName(e.target.value)}
                value={workspaceName}
                style={{ width: '100%' }}
              />


            </CInputGroup>


            <CButton
              style={{marginTop:30, width:'100%'}}              
              color="primary"
              className="primaryButton"
              onClick={editWorkspace}
              disabled={loading}
            >

              {submitting ?
                <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                :
                'Save Workspace'
              }


            </CButton>


          </div>
}


        </div>
      </div>

    </div>
  )
}

export default EditWorkspace