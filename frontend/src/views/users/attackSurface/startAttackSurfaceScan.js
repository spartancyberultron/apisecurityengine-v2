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
  CFormSelect
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const StartAttackSurfaceScan = () => {

  const navigate = useNavigate()

  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const toaster = useRef();


  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('ASIToken');
      const response = await axios.get(`/api/v1/organizations/getProjects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };


  const startScan = () => {

    if (domain == '') {

      setValidationFailed(true);
      setErrorText('Please enter a valid domain');

    } else {

      setLoading(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();

      //formData.append('domain', domain);      

      const body = { "domain": domain, "projectId": selectedProjectId };

      console.log('body:',body)

      
      // Make the API call
      fetch(global.backendUrl + '/api/v1/attackSurfaceScans/startAttackSurfaceScan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': `application/json`
        },
        body: JSON.stringify(body)
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
            setErrorText("Please enter a valid domain");

          } else {

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


            // Move to attack surface scans window in 1 second
            navigate('/attack-surface-management')
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
        navigate('/attack-surface-management')
      }, 10000);

    }

  }

  const isValidEmail = (value) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(value);
  };



  const goBack = (e) => {

    e.preventDefault();
    navigate('/attack-surface-management')
  }


  return (


    <div>

      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

        <span className="pageHeader">Start an Attack Surface Scan</span>
        <CButton
          onClick={goBack}
          className="darkButton"
          color="primary"
        >
          <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight: 10 }} />
          Back to Scans List
        </CButton>
      </div>


      <div className="theCards" style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden' }}>




        <div style={{ width: '60%' }}>

          <div>

            <div style={{ padding: 15 }}>

              <CInputGroup className="" style={{ flexDirection: 'column' }}>

                <CFormInput
                  placeholder="Domain to Scan"
                  autoComplete="domain"
                  className="white-input"
                  onChange={(e) => setDomain(e.target.value)}
                  style={{ width: '100%' }}
                />

                <br />
                <span style={{ fontSize: 12, color: 'blue' }}>Please do not include http/https part. Enter the domain like example.com</span>


              </CInputGroup>


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Select Project</CFormLabel>
              <CInputGroup className="" style={{ flexDirection: 'column', }}>
                <CFormSelect
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  value={selectedProjectId}
                  style={{ width: '100%' }}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option style={{ color: '#000' }} key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </CFormSelect>
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

            </div>

          </div>
        </div>





      </div>

    </div>
  )
}

export default StartAttackSurfaceScan



