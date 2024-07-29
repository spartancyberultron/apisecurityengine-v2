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
  CFormSelect,
  CFormLabel
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const StartLLMScan = () => {

  const navigate = useNavigate()

  const [scanName, setScanName] = useState("")
  const [selectedProbes, setSelectedProbes] = useState(['blank',
    'atkgen',
    'continuation',
    'dan',
    'donotanswer',
    'encoding',
    'gcg',
    'glitch',
    'goodside',
    'knownbadsignatures',
    'leakerplay',
    'lmrc',
    'malwaregen',
    'misleading',
    'packagehallucination',
    'promptinject',
    'realtoxicityprompts',
    'snowball',
    'xss'])


    const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [modelHubKey, setModelHubKey] = useState('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')
  const [modelName, setModelName] = useState('Vartul/t2')

  const [loading, setLoading] = useState(false)

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [scanNameErrorText, setScanNameErrorText] = useState('');
  const [selectedProbesErrorText, setSelectedProbesErrorText] = useState('');
  const [modelHubKeyErrorText, setModelHubKeyErrorText] = useState('');
  const [modelNameErrorText, setModelNameErrorText] = useState('');

  const [scanNameHasError, setScanNameHasError] = useState(false);
  const [selectedProbesHasError, setSelectedProbesHasError] = useState(false);
  const [modelHubKeyHasError, setModelHubKeyHasError] = useState(false);
  const [modelNameHasError, setModelNameHasError] = useState(false);

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

    var allGood = true;

    if (scanName === '') {

      allGood = false;
      setScanNameHasError(true);
      setScanNameErrorText('Scan name is required.');
    }

    if (modelHubKey === '') {

      allGood = false;
      setModelHubKeyHasError(true);
      setModelHubKeyErrorText('Model Hub Key is required.');
    }


    if (modelName === '') {

      allGood = false;
      setModelNameHasError(true);
      setModelNameErrorText('Model name is required.');
    }

    if (allGood == true) {

      setLoading(true)

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('scanName', scanName);
      formData.append('selectedProbes', selectedProbes);
      formData.append('modelHubKey', modelHubKey);
      formData.append('modelName', modelName);
      formData.append('projectId', selectedProjectId);


      const body = {
        "scanName": scanName,
        "selectedProbes": selectedProbes,
        "modelHubKey": modelHubKey,
        "modelName": modelName,
        "projectId":selectedProjectId
      }

      // Make the API call
      fetch(global.backendUrl + '/api/v1/llmScans/startLLMScan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
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
          else {

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


            // Move to LLM scans window in 1 second
            navigate('/llm-scans')
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

        // Move to LLM scans window in 1 second
        navigate('/llm-scans')
      }, 10000);

    }

  }



  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setSelectedProbes((prevSelectedProbes) => {
      if (checked) {
        // Add the checkbox to the selected array
        return [...prevSelectedProbes, name];
      } else {
        // Remove the checkbox from the selected array
        return prevSelectedProbes.filter((probe) => probe !== name);
      }
    });
  };

  const goBack = (e) => {

    e.preventDefault();
    navigate('/llm-scans')
  }


  return (


    <div>

      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

        <span className="pageHeader">Start an LLM Scan</span>
        <CButton
          onClick={goBack}
          className="darkButton"
          color="primary"
        >
          <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight: 10 }} />
          Back to LLM Scans List
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
                  value={scanName}
                  style={{ width: '100%' }}
                />

                {scanNameHasError &&

                  <span style={{ color: 'red', paddingTop: 5, fontSize: 13 }}>{scanNameErrorText}</span>
                }

              </CInputGroup>



              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000', display: 'none' }}>Select Probes</CFormLabel>

              <CInputGroup className="" style={{ flexDirection: 'column', display: 'none' }}>
                <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="blank" id="blank" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> blank
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="atkgen" id="atkgen" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> atkgen
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="continuation" id="continuation" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> continuation
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="dan" id="dan" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> dan
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="donotanswer" id="donotanswer" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> donotanswer
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="encoding" id="encoding" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> encoding
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="gcg" id="gcg" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> gcg
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="glitch" id="glitch" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> glitch
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="goodside" id="goodside" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> goodside
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="knownbadsignatures" id="knownbadsignatures" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> knownbadsignatures
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="leakerplay" id="leakerplay" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> leakerplay
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="lmrc" id="lmrc" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> lmrc
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="malwaregen" id="malwaregen" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> malwaregen
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="misleading" id="misleading" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> misleading
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="packagehallucination" id="packagehallucination" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> packagehallucination
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="promptinject" id="promptinject" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> promptinject
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="realtoxicityprompts" id="realtoxicityprompts" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> realtoxicityprompts
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="snowball" id="snowball" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> snowball
                  </label>

                  <label style={{ flexBasis: '23%' }}>
                    <input type="checkbox" name="xss" id="xss" onChange={handleCheckboxChange} style={{ display: 'inline', width: 'auto' }} /> xss
                  </label>

                  <label style={{ flexBasis: '23%' }}>

                  </label>
                </div>

                {selectedProbesHasError &&
                  <span style={{ color: 'red', paddingTop: 5, fontSize: 13 }}>{selectedProbesErrorText}</span>
                }

              </CInputGroup>


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Model Hub Key</CFormLabel>
              <CInputGroup className="" style={{ flexDirection: 'column' }}>
                <CFormInput
                  placeholder="Model Hub Key"
                  autoComplete="modelHubKey"
                  className="white-input"
                  onChange={(e) => setModelHubKey(e.target.value)}
                  value={modelHubKey}
                  style={{ width: '100%' }}
                />


                {modelHubKeyHasError &&
                  <span style={{ color: 'red', paddingTop: 5, fontSize: 13 }}>{modelHubKeyErrorText}</span>
                }


              </CInputGroup>


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Model Name</CFormLabel>
              <CInputGroup className="" style={{ flexDirection: 'column' }}>
                <CFormInput
                  placeholder="Model Name"
                  autoComplete="modelName"
                  className="white-input"
                  onChange={(e) => setModelName(e.target.value)}
                  value={modelName}
                  style={{ width: '100%' }}
                />


                {modelNameHasError &&
                  <span style={{ color: 'red', paddingTop: 5, fontSize: 13 }}>{modelNameErrorText}</span>
                }


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
                                        <option style={{color:'#000'}} key={project._id} value={project._id}>{project.name}</option>
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
                  'Start LLM Scan'
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

      </div>

    </div>
  )
}

export default StartLLMScan