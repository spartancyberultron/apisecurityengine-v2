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
    COption
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AddAPICollection = () => {

    const navigate = useNavigate()

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [collectionName, setCollectionName] = useState("")
    const [collectionUrl, setCollectionUrl] = useState("")
    const [version, setVersion] = useState("")
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false)

    const [validationFailed, setValidationFailed] = useState(false);
    const [errorText, setErrorText] = useState('');

    const [submissionSuccess, setSubmissionSuccess] = useState(false);

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

    function isExceeding8MB(file) {
        const fileSizeInBytes = file.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        return fileSizeInMB > 8;
    }

    const addCollection = () => {
        if (collectionName === '') {
            setValidationFailed(true);
            setErrorText('Collection name is required.');
            return;
        }

        if (file === null && collectionUrl === '') {
            setValidationFailed(true);
            setErrorText('Please select an API collection file or enter a collection URL.');
            return;
        }

        if (file !== null && isExceeding8MB(file)) {
            setValidationFailed(true);
            setErrorText('The file size must not exceed 8MB. Please attach a smaller file.');
            return;
        }

        if (collectionUrl !== '' && !checkURLType(collectionUrl)) {
            setValidationFailed(true);
            setErrorText('Please enter a valid URL to a JSON or YAML file.');
            return;
        }

        setLoading(true);

        const bearerToken = localStorage.getItem('ASIToken');
        const formData = new FormData();
        formData.append('collectionName', collectionName);
        formData.append('version', "1");
        formData.append('file', file);
        formData.append('collectionUrl', collectionUrl);
        formData.append('projectId', selectedProjectId); // Include selected projectId

        fetch(global.backendUrl + '/api/v1/inventory/addAPICollectionVersion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.hasOwnProperty('error')) {
                    setValidationFailed(true);
                    setErrorText(data.error);
                } else if (data.hasOwnProperty('err')) {
                    setValidationFailed(true);
                    setErrorText("The file does not have a valid Postman/Swagger collection content, or the file is corrupt.");
                } else {
                    setSubmissionSuccess(true);
                    toast('Collection added', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    navigate('/api-inventory');
                }
            })
            .catch(error => {
                console.error('Error adding collection:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const goBack = (e) => {
        e.preventDefault();
        navigate('/api-inventory');
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <span className="pageHeader">Add an API Collection</span>
                <CButton
                    onClick={goBack}
                    className="darkButton"
                    color="primary"
                >
                    <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight: 10 }} />
                    Back to Collections List
                </CButton>
            </div>
            <div className="theCards" style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden' }}>
                <div style={{ width: '60%' }}>
                    <div>
                        <div style={{ padding: 15 }}>
                            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Collection Name</CFormLabel>
                            <CInputGroup className="" style={{ flexDirection: 'column' }}>
                                <CFormInput
                                    placeholder="Collection Name"
                                    autoComplete="projectName"
                                    className="white-input"
                                    onChange={(e) => setCollectionName(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </CInputGroup>
                            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Upload a Postman/Swagger collection file</CFormLabel><br />
                            <span style={{ color: 'blue', fontSize: 13 }}>Please upload only JSON/YAML collections</span><br />
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
                                    <span style={{ color: 'red', paddingTop: 15 }}>{errorText}</span>
                                }
                            </CInputGroup>
                            <p style={{ marginTop: 20 }}>Or</p>
                            <CInputGroup className="" style={{ flexDirection: 'column' }}>
                                <CFormInput
                                    placeholder="URL to the API collection file"
                                    autoComplete="collectionUrl"
                                    className="white-input"
                                    onChange={(e) => setCollectionUrl(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                                <span style={{ color: 'blue', fontSize: 13 }}>Must be a URL of a raw file containing a Postman/Swagger/OpenAPI collection</span><br />
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
                                onClick={addCollection}
                            >
                                {loading ?
                                    <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                                    :
                                    'Submit'
                                }
                            </CButton>
                            {submissionSuccess &&
                                <span style={{ color: 'green', fontSize: 17 }}>The collection is added.</span>
                            }
                        </div>
                    </div>
                </div>
                <div style={{
                    width: '40%', display: 'flex', justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <p style={{ textAlign: 'center', alignSelf: 'center', width: '60%', fontSize: 13 }}>Please ensure the file you input,
                        has valid JSON/YAML content, and are in proper Postman/Swagger/OpenAPI format.</p>
                    <p style={{ textAlign: 'center', alignSelf: 'center', width: '60%', marginTop: 100, fontSize: 13 }}>Around one-third of the tests we run,
                        require the APIs to be called.
                        Please ensure the collection you upload, have the valid authentication tokens for the authenticated endpoints,
                        to allow us to check for all vulnerabilities we check for.</p>
                </div>
            </div>
        </div>
    )
}

export default AddAPICollection;
