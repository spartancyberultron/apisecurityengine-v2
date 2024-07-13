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



const EditProject = () => {

  const navigate = useNavigate()
  const location = useLocation();

  const [projectName, setProjectName] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [project, setProject] = useState([])
  const [projectId, setProjectId] = useState('')

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState('');

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

    var theProjectId = arr[1];

    setProjectId(theProjectId);

    loadProjectDetails(theProjectId);

  }, []);
  

  const fetchWorkspaces = async () => {

    setLoading(true);

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/organizations/getWorkspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setWorkspaces(response.data.workspaces);

    if (response.data.workspaces.length > 0) {
        setWorkspace(response.data.workspaces[0]._id)
    } else {
        setWorkspace('');
    }


    setLoading(false);
  };

  useEffect(() => {

    fetchWorkspaces();

  }, []); 


  const loadProjectDetails = async (theProjectId) => {


    setLoading(true);

    const data = {
      projectId: theProjectId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get('api/v1/organizations/getProjectDetails/'+theProjectId, {
      headers: { Authorization: `Bearer ${token}` },
    });


    setProject(response.data.data);
    setProjectName(response.data.data.name)  
    setWorkspace(response.data.data.workspace._id)

    setLoading(false);

  };


  const editProject = () => {

    if (projectName === '') {

      setValidationFailed(true);
      setErrorText('Name is required.');

    } else {


      setSubmitting(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('name', projectName);    
      formData.append('workspace', workspace); 

     
      const requestData = {
        id:project._id,
        name: projectName,    
        workspace:workspace
    };


      // Make the API call
      fetch(global.backendUrl + '/api/v1/organizations/editProject', {
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

            toast('Project updated', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });


            navigate('/projects')
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
    navigate('/projects')
  }


  return (
    <div style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <div style={{ width: '60%' }}>
        <div>
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2 className="pageHeader">Editing Project</h2>
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
              Back to Projects
            </CButton>
          </div>

          {loading ?
            <ShimmerTable row={8} col={10} />
          :

          <div style={{ width: '100%', backgroundColor: '#fff', padding: 15 }}>

            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: 'white' }}>Project Name</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Project Name"
                autoComplete="projectName"
                className="white-input"
                onChange={(e) => setProjectName(e.target.value)}
                value={projectName}
                style={{ width: '100%' }}
              />


            </CInputGroup>

            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Workspace</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormSelect
                id="workspace"
                className="white-input"
                onChange={(e) => setWorkspace(e.target.value)}
                style={{ width: '100%' }}
              >
                {workspaces.map(workspace => (
                  <option key={workspace._id} value={workspace._id}>
                    {workspace.name}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>



            <CButton
              style={{marginTop:30, width:'100%'}}              
              color="primary"
              className="primaryButton"
              onClick={editProject}
              disabled={loading}
            >

              {submitting ?
                <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                :
                'Save Project'
              }


            </CButton>


          </div>
}


        </div>
      </div>

    </div>
  )
}

export default EditProject