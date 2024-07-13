import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster, CInputGroup } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddProject = () => {


  const [onSubmitting, setOnSubmitting] = useState(false);
  const [projectName, setProjectName] = useState('')  

  const [projectNameEmpty, setProjectNameEmpty] = useState(false) 
 

  const navigate = useNavigate()

  // Function to call the API endpoint
  const addProject = async () => {

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
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/users/addProject', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response
      setOnSubmitting(false);


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
  


  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>
      <div>
        <div style={{ marginBottom: '2rem', }}>
          <h2>Adding Project</h2>
        </div>


        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: 'column', marginTop: 30 }}>
          <CFormInput
            placeholder="Project Name"
            onChange={(e) => setProjectName(e.target.value)}
            className="white-input"
            style={{ width: '30%' }}
          />
          {projectNameEmpty &&
            <span style={{ color: 'red', fontSize: 12, marginTop: 5 }}>Please enter project name</span>
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
            addProject()
          }}
        >
          {onSubmitting ?
            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
            :
            'SAVE PROJECT'
          }
        </CButton>


      </div>
    </div>
  )
}

export default AddProject