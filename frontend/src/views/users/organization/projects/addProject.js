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
  CFormLabel,
  CFormSelect,
  CTextarea
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';


const AddProject = () => {

  const navigate = useNavigate()

  const [projectName, setProjectName] = useState("")
  
  const [loading, setLoading] = useState(false) 
  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');
  const toaster = useRef(); 
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState('');


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


  const addProject = () => {

    if (projectName === '') {

      setValidationFailed(true);
      setErrorText('Name is required.');

    } else {


      setLoading(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('name', projectName);
      formData.append('workspace', workspace);      

      const requestData = {
        name: projectName,
        workspace:workspace
      };


      // Make the API call
      fetch(global.backendUrl + '/api/v1/organizations/addProject', {
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
            setLoading(false);
          }
          else if (data.hasOwnProperty('err')) {
            setLoading(false);
            setValidationFailed(true);
            setErrorText("Something went wrong. Please try again");

          } else {

            setSubmissionSuccess(true);
            setLoading(false);

            toast('Project added', {
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

            <h2 className="pageHeader">Add Project</h2>
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


          <div style={{ width: '100%', backgroundColor: '#fff', padding: 15 }}>


            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Project Name</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Project Name"
                autoComplete="projectName"
                className="white-input"
                onChange={(e) => setProjectName(e.target.value)}
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
              onClick={addProject}
              disabled={loading}            >


              {loading ?
                <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                :
                'Save Project'
              }


            </CButton>


          </div>


        </div>
      </div>

    </div>
  )
}

export default AddProject



