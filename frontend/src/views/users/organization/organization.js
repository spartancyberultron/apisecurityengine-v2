import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import { CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MdDeleteOutline } from "react-icons/md";

const Organization = () => {

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [organization, setOrganization] = useState({})
  const [users, setUsers] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  )

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  }; 



  useEffect(() => {

    window.scrollTo(0, 0);

    loadOrganizationDetails();

  }, []);

  useEffect(() => {
    // console.log('onLoading', onLoading)

  }, [onLoading]);


  const loadOrganizationDetails = async (theScanId) => {

    setOnLoading(true);

    const data = {
      scanId: theScanId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get('api/v1/users/getOrganizationDetails/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrganization(response.data.organization);


    setOnLoading(false);

  };


  return (


    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>
      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

            <h2 style={{ color: '#7366ff', fontWeight: 'bold' }}>Organization</h2>
            <hr />

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 30 }}>

              <div style={{ width: '100%' }}>

                <span>Organization Name : <span style={{ fontWeight: 'bold' }}>{organization.name}</span></span>

              </div>

            </div>



          </div>

        </div>
      </div>
    </div>
  )
}

export default Organization



