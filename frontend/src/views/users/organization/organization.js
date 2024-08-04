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


            <div  style={{ display: 'none', flexDirection: 'row', marginBottom: 30, justifyContent:'space-between', margin:20 }}>

              <div className="theCards" style={{ width: '49%' }}>

                <h4>Severity and Priority Settings </h4>
                <span>Define the severity and priority of issues, as per your organization policy </span>                
       


                <table style={{marginTop:30, width:'100%'}}>
                     <thead>
                        <th style={{padding:10}}>Vulnerability Type</th>
                        <th style={{padding:10}}>Severity</th>
                        <th style={{padding:10}}>Priority</th>
                     </thead>

                     <tbody>
                         <tr>
                            <td>Broken Object Level Authorization</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>

                         <tr>
                            <td>Sensitive Data in Path Params</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Basic Authentication Detected</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Endpoint Not Secured by SSL</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Unauthenticated Endpoint Returning Sensitive Data</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Sensitive Data in Query Params</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>

                         <tr>
                            <td>PII Data Detected in Response</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>



                         <tr>
                            <td>HTTP Verb Tampering Possible</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Content Type Injection Possible</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Security Headers not Enabled on Host</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Resource Deletion Possible</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Broken Authentication</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>



                         <tr>
                            <td>Excessive Data Exposure</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Injection</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Lack of Resource & Rate Limiting</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Wallet Hijacking Possible</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>


                         <tr>
                            <td>Pre Image Attack Possible</td>
                            <td>
                                <select>
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                            </td>
                            <td>

                            <select>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>

                            </td>
                         </tr>

                     </tbody>
                </table>

              </div>


              <div className="theCards" style={{ width: '49%' }}>

              <h4>PII Settings </h4>
                <span>Define the fields considered as PII (Personally Identifiable Information), as per your organization policy </span>

<div style={{display:'flex', flexDirection:'column', marginTop:30}}>

<label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Aadhaar Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Address</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Age</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;AWS Access Key</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;AWS Secret Key</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Bank Account Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Bank Routing</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;BMI</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Blood Pressure</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Brother Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;CA Social Insurance Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Cookie Data</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Credit/Debit Card Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Credit/Debit CVV</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Credit/Debit Expiry</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Date of Birth</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Date Time</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Daughter Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Driving License Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Driver ID</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Email</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Employee ID</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Father Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Heart Rate</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Height</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;IN Aadhaar</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;IN NREGA</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;IN Permanent Account Number (PAN)</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;IN Voter Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;International Bank Account Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Internet Protocol (IP)</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Latitude</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;License Plate</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Longitude</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;MAC Address</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Media Access Control (MAC)</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Mother Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Order ID</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Passport Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Password</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Phone Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;PIN</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Place of Birth</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Race</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Religion</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Sister Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Social Security Number (SSN)</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Son Name</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Swift Code</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Transaction ID</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;UK National Health Service Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;UK National Insurance Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;UK Unique Taxpayer Reference Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;URL</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Username</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;US Individual Tax Identification Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Vehicle Identification Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Vehicle Registration Number</label>
    <label className="theCheckboxLabel"><input type="checkbox" className="theCheckbox" /> &nbsp;&nbsp;Voter ID Number</label>

    </div>

              </div>

            </div>


          </div>

        </div>
      </div>
    </div>
  )
}

export default Organization



