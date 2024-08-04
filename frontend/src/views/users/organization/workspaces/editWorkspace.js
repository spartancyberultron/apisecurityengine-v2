import React, { useState, useEffect, useRef } from "react";
import { CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShimmerTable } from "react-shimmer-effects";
import {
  CButton,
  CForm,
  CFormInput,
  CInputGroup,
  CFormLabel
} from '@coreui/react';
import { IoMdArrowRoundBack } from "react-icons/io";

const EditWorkspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workspace, setWorkspace] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  
  const toaster = useRef();
  
  // Fetch teams from the API
  const fetchTeams = async () => {
    setLoading(true);
    const token = localStorage.getItem('ASIToken');
    try {
      const response = await axios.get('/api/v1/organizations/getTeams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data.teams);
    } catch (error) {
      console.error("Error fetching teams", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load workspace details and fetch teams on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const arr = location.search.split('=');
    const theWorkspaceId = arr[1];
    
    setWorkspaceId(theWorkspaceId);
    loadWorkspaceDetails(theWorkspaceId);
    fetchTeams();
  }, []);
  
  // Load workspace details from the API
  const loadWorkspaceDetails = async (theWorkspaceId) => {
    setLoading(true);
    const token = localStorage.getItem('ASIToken');
    try {
      const response = await axios.get(`api/v1/organizations/getWorkspaceDetails/${theWorkspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspace(response.data.data);
      setWorkspaceName(response.data.data.name);
      
      // Set selected teams if they are part of the workspace
      const initialSelectedTeams = response.data.data.teams.map(team => ({
        value: team._id,
        label: team.name
      }));
      setSelectedTeams(initialSelectedTeams);
    } catch (error) {
      console.error("Error loading workspace details", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle workspace update
  const editWorkspace = () => {
    if (workspaceName === '') {
      setValidationFailed(true);
      setErrorText('Name is required.');
    } else {
      setSubmitting(true);
      const bearerToken = localStorage.getItem('ASIToken');
      const requestData = {
        id: workspace._id,
        name: workspaceName,
        teams: selectedTeams.map(team => team.value) // Include selected team IDs
      };
      
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
        if (data.hasOwnProperty('error')) {
          setValidationFailed(true);
          setErrorText(data.error);
          setSubmitting(false);
        } else if (data.hasOwnProperty('err')) {
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
          navigate('/workspaces');
        }
      })
      .catch(error => {
        console.error(error);
      });
    }
  };
  
  // Navigate back to the workspaces list
  const goBack = (e) => {
    e.preventDefault();
    navigate('/workspaces');
  };
  
  // Convert teams into the format required by react-select
  const formatTeams = (teams) => {
    return teams.map(team => ({
      value: team._id,
      label: team.name
    }));
  };
  
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
          
          {loading ? (
            <ShimmerTable row={8} col={10} />
          ) : (
            <div style={{ width: '100%', backgroundColor: '#fff', padding: 15, height:'100vh' }}>
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
              
              <CFormLabel htmlFor="teamsSelect" style={{ marginTop: 30, color: '#000' }}>Select Teams</CFormLabel>
              <Select
                isMulti
                name="teams"
                options={formatTeams(teams)}
                value={selectedTeams}
                onChange={(selectedOptions) => {
                  setSelectedTeams(selectedOptions || []);
                }}
                placeholder="Select Teams"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999, // Ensure dropdown is on top
                  }),
                }}
              />
              
              <CButton
                style={{ marginTop: 30, width: '100%' }}
                color="primary"
                className="primaryButton"
                onClick={editWorkspace}
                disabled={loading}
              >
                {submitting ? (
                  <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                ) : (
                  'Save Workspace'
                )}
              </CButton>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default EditWorkspace;
