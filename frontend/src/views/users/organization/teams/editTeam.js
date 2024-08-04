import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Select from 'react-select'; // Import react-select

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
} from '@coreui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ShimmerTable } from "react-shimmer-effects";

const EditTeam = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [users, setUsers] = useState([]); // State for users
  const [selectedUsers, setSelectedUsers] = useState([]); // State for selected users

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

    var arr = location.search.split('=');
    var theTeamId = arr[1];
    setTeamId(theTeamId);

    loadTeamDetails(theTeamId);
    fetchUsers(); // Fetch users when component mounts
  }, []);

  const loadTeamDetails = async (theTeamId) => {
    setLoading(true);

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`api/v1/organizations/getTeamDetails/${theTeamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTeam(response.data.data);
    setTeamName(response.data.data.name);
    setSelectedUsers(response.data.data.users || []); // Set selected users if any

    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/organizations/getOrganizationUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(response.data.users.map(user => ({
      value: user._id,
      label: `${user.firstName} ${user.lastName} (${user.email})`
    })));

    setLoading(false);
  };

  const editTeam = () => {
    if (teamName === '') {
      setValidationFailed(true);
      setErrorText('Name is required.');
    } else {
      setSubmitting(true);

      const bearerToken = localStorage.getItem('ASIToken');

      const requestData = {
        id: team._id,
        name: teamName,
        users: selectedUsers.map(user => user.value) // Include selected users
      };

      fetch(global.backendUrl + '/api/v1/organizations/editTeam', {
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

            toast('Team updated', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });

            navigate('/teams');
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const goBack = (e) => {
    e.preventDefault();
    navigate('/teams');
  };

  return (
    <div style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>
      <div style={{ width: '60%' }}>
        <div>
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <h2 className="pageHeader">Editing Team</h2>
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
              Back to Teams
            </CButton>
          </div>

          {loading ?
            <ShimmerTable row={8} col={10} />
            :
            <div style={{ width: '100%', backgroundColor: '#fff', padding: 15, height:'100vh'  }}>
              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: '#000' }}>Team Name</CFormLabel>
              <CInputGroup className="" style={{ flexDirection: 'column' }}>
                <CFormInput
                  placeholder="Team Name"
                  autoComplete="teamName"
                  className="white-input"
                  onChange={(e) => setTeamName(e.target.value)}
                  value={teamName}
                  style={{ width: '100%' }}
                />
              </CInputGroup>

              <CFormLabel htmlFor="userSelect" style={{ marginTop: 30, color: '#000' }}>Select Users</CFormLabel>


              <Select
                id="userSelect"
                isMulti
                options={users}
                value={selectedUsers}
                onChange={setSelectedUsers}
                className="basic-multi-select"
                classNamePrefix="select"
              />


              <CButton
                style={{ marginTop: 30, width: '100%' }}
                color="primary"
                className="primaryButton"
                onClick={editTeam}
                disabled={loading}
              >
                {submitting ?
                  <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                  :
                  'Save Team'
                }
              </CButton>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default EditTeam;
