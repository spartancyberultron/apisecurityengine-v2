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
  CFormSelect,
  CRow,
  CFormLabel
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const StartSOAPGraphQLScan = () => {

  const navigate = useNavigate()

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scanName, setScanName] = useState("")
  const [file, setFile] = useState(null);
  const [type, setType] = useState('soap');
  const [loading, setLoading] = useState(false)
  const [projectPhase, setProjectPhase] = useState("Development")

  const [collectionUrl, setCollectionUrl] = useState('');

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const toaster = useRef();

  function isExceeding8MB(file) {

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


  const setTheType = (event) => {

    setType(event.target.value);
  }

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

    if (scanName === '') {

      setValidationFailed(true);
      setErrorText('Scan name is required.');

    } else if (collectionUrl === '') {

      setValidationFailed(true);
      setErrorText('Please enter URL of a SOAP/GraphQL API collection');

    } 
    //else if ((file !== null && (typeof file !== 'undefined')) && isExceeding8MB(file)) {
//
    //  setValidationFailed(true);
    //  setErrorText('The file size must not exceed 8MB. Please attach a smaller file');

   // }
     else {

      setLoading(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('scanName', scanName);
      formData.append('collectionUrl', collectionUrl);
      formData.append('type', type);
      formData.append('projectId', selectedProjectId); // Include selected projectId
      formData.append('projectPhase', projectPhase); 

      // Make the API call
      fetch(global.backendUrl + '/api/v1/soapOrGraphQLScans/startSOAPOrGraphQLScan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        },
        body: formData
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
            setErrorText("The URL does not have a valid SOAP/GraphQL collection content, or the content is corrupt.");

          } else {

            setSubmissionSuccess(true);
            setLoading(false);

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
            navigate('/soap-graphql-scans')
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
        navigate('/soap-graphql-scans')
      }, 10000);

    }
  }


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const goBack = (e) => {

    e.preventDefault();
    navigate('/soap-graphql-scans')
  }

  return (


    <div>

      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

        <span className="pageHeader">Start a SOAP/GraphQL API Scan</span>
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


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Scan Name</CFormLabel>
              <CInputGroup className="" style={{ flexDirection: 'column' }}>
                <CFormInput
                  placeholder="Scan Name"
                  autoComplete="scanName"
                  className="white-input"
                  onChange={(e) => setScanName(e.target.value)}
                  style={{ width: '100%' }}
                />


              </CInputGroup>


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Collection File URL (Raw)</CFormLabel>
              <br />
              <span style={{ color: 'blue', fontSize: 13 }}>Please ensure the URL contains only .xml/.gql/.graphql documents</span><br />

              <CInputGroup className="" style={{ flexDirection: 'column' }}>
                <CFormInput
                  placeholder="Collection File URL"
                  autoComplete="scanName"
                  className="white-input"
                  onChange={(e) => setCollectionUrl(e.target.value)}
                  style={{ width: '100%' }}
                />


              </CInputGroup>



              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000', display:'none' }}>Upload a SOAP/GraphQL collection file</CFormLabel><br />
              <span style={{ color: 'blue', fontSize: 13, display:'none' }}>Please upload only .xml/.gql/.graphql documents</span><br />

              <CInputGroup className="" style={{ flexDirection: 'column',display:'none' }}>
                <CFormInput
                  placeholder="Upload SOAP/GraphQL Collection"
                  autoComplete="username"
                  type="file"
                  className="white-input"
                  size="sm"
                  id="inputFile"
                  accept="application/xml, application/asmx, application/graphql, .graphql, .xml, .asmx"
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />


                {validationFailed &&

                  <span style={{ color: 'red', paddingTop: 15 }}>{errorText}</span>
                }

              </CInputGroup>


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Type (SOAP or GraphQL)</CFormLabel><br />

              <CFormSelect
                value={type}
                name="type"
                onChange={(e) => setType(e.target.value)}
                options={[{ value: 'soap', label: 'SOAP' }, { value: 'graphql', label: 'GraphQL', }]}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >

              </CFormSelect>

              {validationFailed &&

                <span style={{ color: 'red', paddingTop: 15 }}>{errorText}</span>
              }


<CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Select Project</CFormLabel>
                      <CInputGroup className="" style={{ flexDirection: 'column', }}>
                                <CFormSelect
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    value={selectedProjectId}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(project => (
                                        <option style={{color:'#000'}} key={project._id} value={project._id}>{project.name}</option>
                                    ))}
                                </CFormSelect>
                            </CInputGroup>


                            <div className="mb-3" style={{ marginTop: 20, marginBottom: 20, }}>
        <label htmlFor="projectPhase">Project Phase</label>
        <select 
            id="projectPhase" 
            value={projectPhase} 
            onChange={(e) => setProjectPhase(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
        >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Maintenance">Maintenance</option>
        </select>
    </div> 



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
                <span style={{ color: 'green', fontSize: 17 }}>The scan is started.
                  <br /> <br />
                  Moving to scans list in 5 seconds...
                </span>
              }
            </div>


          </div>
        </div>



        <div style={{
          width: '40%', display: 'flex', justifyContent: 'center',
          flexDirection: 'column',
        }}>


          <p style={{ textAlign: 'center', alignSelf: 'center', width: '60%', fontSize: 13 }}>Please ensure the file you input,
            has valid .xml/.gql/.graphql content, and are in proper SOAP/GraphQL format.
          </p>

        </div>

      </div>

    </div>
  )
}

export default StartSOAPGraphQLScan