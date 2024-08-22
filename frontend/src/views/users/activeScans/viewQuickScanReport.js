import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'

import axios from 'axios';

import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Modal from 'react-modal';
import { AiFillCloseCircle } from "react-icons/ai";
import zIndex from "@mui/material/styles/zIndex";
import { borderColor } from "@mui/system";
import { CircularProgress } from '@mui/material';

import { IoMdArrowRoundBack } from "react-icons/io";
import { BiExport } from "react-icons/bi";
import { ShimmerTable, ShimmerTitle, ShimmerCircularImage } from "react-shimmer-effects";
import { CgNotes } from "react-icons/cg";
import { extractHostAndEndpoint } from '../utils';
import { CiEdit } from "react-icons/ci";


import Chart from 'react-apexcharts'

const ViewQuickScanReport = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [activeScan, setActiveScan] = useState(null)
  const [onLoading, setOnLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [findingsModalIsOpen, setFindingsModalIsOpen] = React.useState(false);
  const [currentVulnerability, setCurrentVulnerability] = React.useState(null);
  
  const [currentVulnForRiskAcceptance, setCurrentVulnForRiskAcceptance] = React.useState(null);

  const [exportingPDF, setExportingPDF] = useState(false);
  const [reasonEmptyError, setReasonEmptyError] = useState(false);

  const [findings, setFindings] = useState([]);
  const [sslFindings, setSSLFindings] = useState([]);

  const [submittingReason, setSubmittingReason] = useState(false);

  const [acceptanceModalIsOpen, setAcceptanceModalIsOpen] = useState(false);
  const [riskAcceptance, setRiskAcceptance] = useState("No");
  const [reason, setReason] = useState('');

  const [costOfBreachModalIsOpen, setCostOfBreachModalIsOpen] = React.useState(false);

  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  )


  const handleModalOpen = (value) => {

    setCurrentVulnForRiskAcceptance(value);

    if(value.riskAcceptance && value.riskAcceptance == 'Yes'){
      setRiskAcceptance(value.riskAcceptance);
    }else{
      setRiskAcceptance("No")
    }    

    if(value.riskAcceptanceReason && value.riskAcceptanceReason.length> 0){
      setReason(value.riskAcceptanceReason);
    }else{
      setReason("")
    }

    setAcceptanceModalIsOpen(true);
  };

  function convertHeaderString(headerString) {
    const parts = headerString.split(':');
    if (parts.length < 2) {
        return headerString; // No colon found, return the original string
    }

    const headerName = parts[0];
    const description = parts.slice(1).join(':');

    const properHeaderName = headerName.split('-').map(word => {
        if (word.length === 1) {
            return word.toUpperCase();
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    }).join('-');

    return `<strong>${properHeaderName}</strong>:${description.trim()}`;
}

function getHeaderDescAndExploitability(headerString) {

  var headerName = '';

  const parts = headerString.split(':');
  if (parts.length < 2) {
    headerName = headerString; // No colon found, return the original string
  }else{
    headerName = parts[0];
  }

  headerName = headerName.toLowerCase()

  if(headerName.includes('content-security-policy')){

    return {
      description:'The host lacks a Content Security Policy (CSP) security header, leaving it vulnerable to cross-site scripting (XSS) and data injection attacks.',
      exploitability:'Attackers can exploit this vulnerability by injecting malicious scripts into the web application, leading to data theft, session hijacking, or unauthorized actions.'
    }

  }else if(headerName.includes('strict')){

    return {
      description:'The vulnerability occurs when a web host does not have HTTP Strict Transport Security (HSTS) headers enabled, allowing attackers to perform man-in-the-middle attacks by forcing users to access the site over an insecure HTTP connection.',
      exploitability:'Exploitable by attackers intercepting or manipulating the insecure HTTP traffic, potentially compromising the integrity and confidentiality of user data.'
    }

  }else if(headerName.includes('x-frame-options')){

    return {
      description:'The "Security Headers Not Enabled on Host - X-Frame-Options" vulnerability occurs when the X-Frame-Options header is not set, allowing the website to be embedded in an iframe.',
      exploitability:'This vulnerability can be exploited to perform clickjacking attacks, where an attacker tricks users into clicking on something different from what the user perceives, potentially leading to unauthorized actions or data breaches.'
    }
    
  }else if(headerName.includes('x-content-type-options')){

    return {
      description:'The "X-Content-Type-Options" header is not enabled on the host, allowing the browser to interpret files as a different MIME type than declared, which can lead to security risks like MIME type sniffing.',
      exploitability:'Attackers can exploit this vulnerability to execute malicious content by tricking the browser into misinterpreting the content type, potentially leading to cross-site scripting (XSS) or other injection attacks.'
    }
    
  }else if(headerName.includes('x-xss-protection')){

    return {
      description:'The security header "X-XSS-Protection" is not enabled on the host, leaving the application vulnerable to cross-site scripting (XSS) attacks.',
      exploitability:'Attackers can exploit this vulnerability to inject malicious scripts into web pages, potentially stealing sensitive information or executing unauthorized actions.'
    }
    
  }else if(headerName.includes('cross-origin')){

    return {
      description:'The "Security Headers Not Enabled on Host - Cross-Origin Resource Sharing" vulnerability occurs when a web server does not properly set security headers, allowing potentially malicious sites to interact with it via CORS.',
      exploitability:' This vulnerability can be exploited by attackers to perform cross-origin requests, leading to data theft, unauthorized actions, or exposure of sensitive information.'
    }
    
  }else if(headerName.includes('referrer-policy')){

    return {
      description:'The "Referrer-Policy" security header is not enabled, which can lead to unintended leakage of sensitive information in the HTTP referrer header when navigating from HTTPS to HTTP sites.',
      exploitability:' Attackers can exploit this by capturing referrer headers to gain access to sensitive data, which can then be used for further attacks such as phishing or data theft.'
    }
    
  }else if(headerName.includes('feature-policy')){

    return {
      description:'The "Feature-Policy" security header is not enabled on the host, which limits control over which browser features can be used in the application.',
      exploitability:'Attackers can exploit this by leveraging unused or potentially unsafe browser features, increasing the risk of attacks like cross-site scripting (XSS) and data exfiltration.'
    }
    
  }else{
    return {
      description:'',
      exploitability:''
    }
  }

  
}


  const handleModalClose = () => {
    //setShowModal(false);
  };

  const handleDropdownChange = (event) => {

    setRiskAcceptance(event.target.value);
  };

  const customStyles1 = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '1000px',
    width: '90%',
    maxHeight: '80%',
    overflowY: 'auto'
  }
};

const customStyles2 = {
  content: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Center the modal
    width: 'auto', // Width adjusts to content
    height: '70%', // Height adjusts to content
    maxWidth: '90%', // Optional: Limit width to 90% of the viewport
    maxHeight: '90%', // Optional: Limit height to 90% of the viewport
    backgroundColor: '#c2eef4',
    borderRadius: 15,
    borderColor: 'yellow',
    zIndex: 10000,
    overflow: 'auto', // Ensure content scrolls if it overflows
  },
};


const openCostOfBreachModal = async (value) => {


  setCurrentVulnerability(value);

  setCostOfBreachModalIsOpen(true);
};



const closeCostOfBreachModal = async () => {

  setCostOfBreachModalIsOpen(false);
};


  const handleAcceptanceSave = async() => {

    if(reason == ''){
      setReasonEmptyError(true);

    }else{

      setSubmittingReason(true);    

      const data = {
        activeScanVulnId: currentVulnForRiskAcceptance._id,
        riskAcceptance:riskAcceptance,
        riskAcceptanceReason:reason
      };


      const token = localStorage.getItem('ASIToken');
      const response = await axios.post('api/v1/users/updateRiskAcceptanceForAnActiveScanVulnerability', data, {
          headers: { Authorization: `Bearer ${token}` },
      });


      if(response.data.data){

        setActiveScan((prevState) => ({
          ...prevState,
          vulnerabilities: prevState.vulnerabilities.map((vuln) => {
            if (vuln._id === currentVulnForRiskAcceptance._id) {
              return {
                ...vuln,
                riskAcceptance: riskAcceptance,
                riskAcceptanceReason: reason,
              };
            }
            return vuln;
          }),
        }));

        setAcceptanceModalIsOpen(false);

        setRiskAcceptance('No');
        setReason("");
        setSubmittingReason(false)

      }     
      
    }
    

  };



  const customStyles = {
    content: {
      top: '20%',
      left: '20%',
      width: '70%',
      right: 'auto',
      bottom: 'auto',
      height: '70%',
      backgroundColor: '#E1E1E1',
      borderRadius: 15,
      borderColor: 'yellow',
      zIndex: 10000
    },
  };

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };


  ChartJS.register(ArcElement, Tooltip, Legend);

  useEffect(() => {

    window.scrollTo(0, 0);

    setOnLoading(true);

    var arr = location.search.split('=');

    var theScanId = arr[1];

    setScanId(theScanId);

    loadScanDetails(theScanId, 0, rowsPerPage);

  }, []);

  useEffect(() => {

  }, [onLoading]);


  const loadScanDetails = async (theScanId, page, rowsPerPage) => {

    setOnLoading(true);

    const data = {
      scanId: theScanId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.post(`api/v1/activeScans/getActiveScanDetails/${page}/${rowsPerPage}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setActiveScan(response.data.activeScan);
    setCount(response.data.totalCount);   

    setOnLoading(false);
  };


  const downloadPDF = async (e) => {

    e.preventDefault();

    const urlToOpen = global.reportAPIURL + scanId + '/' + activeScan.user._id;
    window.open(urlToOpen, '_blank');
  }


  const openRemediationModal = async (value) => {

    setCurrentVulnerability(value);

    setModalIsOpen(true);
  };

  const openFindingsModal = async (value, currentVuln) => {

   

    setFindings(value);

    if(currentVuln.vulnerability.vulnerabilityCode == 4){
        setSSLFindings(currentVuln.sslFindings);
    }

    setCurrentVulnerability(currentVuln)

    setFindingsModalIsOpen(true);
  };

  console.log('findings:',findings)

  const closeFindingsModal = async () => {

    setFindingsModalIsOpen(false);
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };

  const closeAcceptanceModal = async () => {

    setAcceptanceModalIsOpen(false);

  };

  const goBack = async () => {

    navigate('/active-scans')
  }

  const columns = [
    {
      label: "#",
      options: {
        filter: false,
      }
    },
    {
      label: "Vulnerability",
      options: {
        filter: true,
      }
    },
    {
      label: "Host",
      options: {
        filter: true,
      }
    },
    {
      label: "Endpoint",
      options: {
        filter: true,
      }
    },
    {
      label: "Auth Type",
      options: {
        filter: true,
      }
    },
    {
      label: "Description",
      options: {
        filter: false,
      }
    },
    {
      label: "",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection:'column',
              alignItems: "center"
            }} >

           
{(value.vulnerability.vulnerabilityCode == 10 ||
value.vulnerability.vulnerabilityCode == 4 ||
value.vulnerability.vulnerabilityCode == 8 ||
value.vulnerability.vulnerabilityCode == 2 ||
value.vulnerability.vulnerabilityCode == 6) &&
              <CButton color="primary" variant="outline"
                onClick={() => openFindingsModal(value.findings, value)}
                className="primaryButton" style={{ fontSize: 13, color: 'white', width:200 }}>

                  {value.vulnerability.vulnerabilityCode == 10 &&
                  'View Missing Headers and Exploitability'
                  }

                  {value.vulnerability.vulnerabilityCode == 4 &&
                  'View SSL Problems and Exploitability'
                  }

                  {value.vulnerability.vulnerabilityCode == 8 &&
                    'View Methods'
                  } 

                  {value.vulnerability.vulnerabilityCode == 2 || value.vulnerability.vulnerabilityCode == 6  &&
                    'View PII Data'
                  }                  

              </CButton>
        }
              
            </div>
          )
        }
      }
    },
    {
      label: "Severity",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {

          let bgColor;
          let theColor;

          if (value == 'CRITICAL') {

            bgColor = '#FF0000';
            theColor = '#fff';

          } else if (value == 'HIGH') {

            bgColor = '#A6001B';
            theColor = '#fff';

          } else if (value == 'MEDIUM') {

            bgColor = '#FFC300';
            theColor = 'black';

          } else if (value == 'LOW') {

            bgColor = '#B3FFB3';
            theColor = 'fff';
          }


          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              <div style={{
                padding: 5, backgroundColor: bgColor, color: theColor, width: 120,
                textAlign: 'center', borderRadius: 10, fontSize: 12, fontWeight: 'normal'
              }}>{value}</div>

            </div>
          )
        }
      }
    },
    {
      label: "OWASP",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection:'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                <span key={index} style={{
                  padding: 5,
                  width: 120,
                  textAlign: 'center',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 'normal',
                  marginRight: 5,
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
                }}>
                  {item}
                </span>
                
                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "CWE",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              alignItems: "center",
              flexDirection:'column',
            }} >
              {value.map((item, index) => (
                <span key={index} style={{
                  padding: 5,
                  width: 120,
                  textAlign: 'center',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 'normal',
                  marginRight: 5,
                  color:'#000',
                  backgroundColor: '#80faff',
                  margin:5
                }}>
                  {item}
                </span>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "Remediations",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              <CButton color="primary" variant="outline"
                onClick={() => openRemediationModal(value)}
                className="primaryButton" style={{ fontSize: 13, color: 'white', width:200 }}>View Remediations
              </CButton>

            </div>
          )
        }
      }
    },
    {
      label: "Cost of Breach",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              alignItems: "center",
              flexDirection:'column'
            }} >

             

              <CButton color="primary" variant="outline"
                onClick={() => openCostOfBreachModal(value)}
                className="primaryButton" style={{ fontSize: 13, color: 'white', width:200,
                backgroundColor:'#00bad1', borderColor:'#00bad1' }}>View Cost of Breach
              </CButton>

            </div>
          )
        }
      }
    },     
    {
      label: "Risk Acceptance",
      options: {
        filter: true,
        filterType: 'dropdown', // Adjust based on your filter type
        filterList: [],
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              alignItems: "center",
              flexDirection: 'column',
            }}>
              {value.riskAcceptance && value.riskAcceptance === 'Yes' ?
                <span style={{
                  backgroundColor: '#28c76f', color: '#fff', padding: 5,
                  width: 120,
                  textAlign: 'center',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 'normal',
                  marginRight: 5,
                  margin: 5
                }} onClick={() => handleModalOpen(value)}>Yes &nbsp;&nbsp;&nbsp;<CiEdit size={20} /></span>
                :
                <span style={{
                  backgroundColor: '#ea5455', color: '#fff', padding: 5,
                  width: 120,
                  textAlign: 'center',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 'normal',
                  marginRight: 5,
                  margin: 5
                }} onClick={() => handleModalOpen(value)}>No &nbsp;&nbsp;&nbsp;<CiEdit size={20} /></span>
              }
            </div>
          )
        },
        filterOptions: {
          names: ['Yes', 'No'],
          logic: (value, filterVal) => {
            return filterVal.length > 0 ? filterVal.includes(value.riskAcceptance) : true;
          },
          display: (filterList, onChange, index, column) => (
            <div>
              <select
                onChange={(event) => onChange(event.target.value)}
                value={filterList[index] || 'All'}
              >
                <option value='All'>All</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
            </div>
          ),
        },
      }
    },
    {
      label: "RiskAcceptanceHiddenColumn",
      options: {
        filter: false,
        display:false,
        filterType: 'dropdown', // Adjust based on your filter type
        filterList: [],
        
        
      }
    }
  ];

  const getMuiTheme = () => createTheme({
    components: {
      MUIDataTableBodyCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: 30,
            },
          }
        }
      },  
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: 30,
            },
          }
        }
      },

    }
  })


  const options = {
    filterType: "dropdown",
    responsive: "stacked",
    elevation: 0, //for table shadow box
    filter: true,
    download: true,
    print: true,
    search: true,
    searchOpen: false,
    viewColumns: true,
    pagination:true,
    selectableRows: false, // <===== will turn off checkboxes in rows
    rowsPerPageOptions: [10, 20, 60, 100, 150],
    textLabels: {
      body: {
        noMatch: 'No vulnerabilities found',
      }
    },
    setRowProps: (row, dataIndex, rowIndex) => {

      console.log('row', row)
      return {
        style: {
          backgroundColor: row[13] === 'Yes' ? "#FFCCCC" : "#ffffff" // Alternate row colors
        }
      };
    },
    serverSide: true,
    count: count,
    page: page,
    rowsPerPage: rowsPerPage,
    onTableChange: (action, tableState) => {
      if (action === 'changePage' || action === 'changeRowsPerPage') {
        const { page, rowsPerPage } = tableState;
        setPage(page);
        setRowsPerPage(rowsPerPage);
        loadScanDetails(scanId, page, rowsPerPage);
      }
    }
  };


  var tableData = [];

  if (activeScan && activeScan.vulnerabilities) {

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(((page) * 10) + (i+1));
      dataItem.push(activeScan.vulnerabilities[i].vulnerability.vulnerabilityName);

      var endpointObject = activeScan.vulnerabilities[i].endpoint;

      if (endpointObject) {
        if ((extractHostAndEndpoint(endpointObject.url))) {
          dataItem.push((extractHostAndEndpoint(endpointObject.url)).host);
        } else {
          dataItem.push('---');
        }
      } else {
        dataItem.push('---');
      }


      if (endpointObject) {
        if ((extractHostAndEndpoint(endpointObject.url))) {
          dataItem.push((extractHostAndEndpoint(endpointObject.url)).endpoint);
        } else {
          dataItem.push('---');
        }
      } else {
        dataItem.push('---');
      }

      let isAuthenticated = false;

      // Check if authorization type is 'None' or if any header has key as "Authorization"
      if (endpointObject.authorization.type === 'None' || endpointObject.headers.some(header => header.key === 'Authorization')) {
        isAuthenticated = true;
      }

      // Push appropriate value based on isAuthenticated
      if (isAuthenticated) {
        dataItem.push('Authenticated');
      } else {
        dataItem.push('Unauthenticated');
      }


      dataItem.push(activeScan.vulnerabilities[i].description);

      dataItem.push(activeScan.vulnerabilities[i]);

      dataItem.push(activeScan.vulnerabilities[i].severity);

      dataItem.push(activeScan.vulnerabilities[i].vulnerability.owasp);
      
      dataItem.push((activeScan.vulnerabilities[i].vulnerability.cwe).concat(activeScan.vulnerabilities[i].additionalCWEs));

      dataItem.push(activeScan.vulnerabilities[i]);

      dataItem.push(activeScan.vulnerabilities[i]); 

      dataItem.push(activeScan.vulnerabilities[i]); // For risk acceptance

      dataItem.push(activeScan.vulnerabilities[i].riskAcceptance?activeScan.vulnerabilities[i].riskAcceptance:'No'); // For risk acceptance

      tableData.push(dataItem);
    }
  }


  var numOfHighVulns = 0
  var numOfMediumVulns = 0;

  if (activeScan) {

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

      if (activeScan.vulnerabilities[i].vulnerability.riskScore == 'HIGH') {
        numOfHighVulns++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.riskScore == 'MEDIUM') {
        numOfMediumVulns++;
      }
    }
  }


  var vuln1Count = 0;
  var vuln2Count = 0;
  var vuln3Count = 0;
  var vuln4Count = 0;
  var vuln5Count = 0;
  var vuln6Count = 0;
  var vuln7Count = 0;
  var vuln8Count = 0;
  var vuln9Count = 0;
  var vuln10Count = 0;
  var vuln11Count = 0;
  var vuln12Count = 0;
  var vuln13Count = 0;
  var vuln14Count = 0;
  var vuln15Count = 0;
  var vuln16Count = 0;
  var vuln17Count = 0;
  var vuln18Count = 0;

  if (activeScan) {

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 1) {
        vuln1Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 2) {
        vuln2Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 3) {
        vuln3Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 4) {
        vuln4Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 5) {
        vuln5Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 6) {
        vuln6Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 7) {
        vuln7Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 8) {
        vuln8Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 9) {
        vuln9Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 10) {
        vuln10Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 11) {
        vuln11Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 12) {
        vuln12Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 13) {
        vuln13Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 14) {
        vuln14Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 15) {
        vuln15Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 16) {
        vuln16Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 17) {
        vuln17Count++;
      }

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 18) {
        vuln18Count++;
      }

    }
  }

  var labelsArray = [];
  if (vuln1Count > 0) {
    labelsArray.push('Broken Object Level Authorization');
  }
  if (vuln2Count > 0) {
    labelsArray.push('Sensitive Data in Path Params');
  }
  if (vuln3Count > 0) {
    labelsArray.push('Basic Authentication Detected');
  }
  if (vuln4Count > 0) {
    labelsArray.push('Endpoint Not Secured by SSL');
  }
  if (vuln5Count > 0) {
    labelsArray.push('Unauthenticated Endpoint Returning Sensitive Data');
  }
  if (vuln6Count > 0) {
    labelsArray.push('Sensitive Data in Query Params');
  }
  if (vuln7Count > 0) {
    labelsArray.push('PII Data Detected in Response');
  }
  if (vuln8Count > 0) {
    labelsArray.push('HTTP Verb Tampering Possible');
  }
  if (vuln9Count > 0) {
    labelsArray.push('Content Type Injection Possible');
  }
  if (vuln10Count > 0) {
    labelsArray.push('Security Headers not Enabled on Host');
  }
  if (vuln11Count > 0) {
    labelsArray.push('Resource Deletion Possible');
  }
  if (vuln12Count > 0) {
    labelsArray.push('Broken Authentication');
  }
  if (vuln13Count > 0) {
    labelsArray.push('Excessive Data Exposure');
  }
  if (vuln14Count > 0) {
    labelsArray.push('Injection');
  }
  if (vuln15Count > 0) {
    labelsArray.push('XSS Vulnerability Found');
  }
  if (vuln16Count > 0) {
    labelsArray.push('Wallet Hijacking Possible');
  }
  if (vuln17Count > 0) {
    labelsArray.push('Pre Image Attack Possible');
  }
  if (vuln18Count > 0) {
    labelsArray.push('Lack of Resource & Rate Limiting');
  }

  var dataArray = [];
  var bgColorArray = [];


  const pieColors = [
    '#FF5733', '#33A02C', '#1F77B4', '#FF8C00',
    '#32CD32', '#6495ED', '#FF4500', '#228B22',
    '#4169E1', '#FF6347', '#7CFC00', '#6495ED',
    '#FF5733', '#33A02C', '#1F77B4', '#FF8C00',
    '#32CD32', '#4169E1'
  ];


  if (vuln1Count > 0) {
    dataArray.push(vuln1Count);
    bgColorArray.push(pieColors[0]);
  }
  if (vuln2Count > 0) {
    dataArray.push(vuln2Count);
    bgColorArray.push(pieColors[1]);
  }
  if (vuln3Count > 0) {
    dataArray.push(vuln3Count);
    bgColorArray.push(pieColors[2]);
  }
  if (vuln4Count > 0) {
    dataArray.push(vuln4Count);
    bgColorArray.push(pieColors[3]);
  }
  if (vuln5Count > 0) {
    dataArray.push(vuln5Count);
    bgColorArray.push(pieColors[4]);
  }
  if (vuln6Count > 0) {
    dataArray.push(vuln6Count);
    bgColorArray.push(pieColors[5]);
  }
  if (vuln7Count > 0) {
    dataArray.push(vuln7Count);
    bgColorArray.push(pieColors[6]);
  }
  if (vuln8Count > 0) {
    dataArray.push(vuln8Count);
    bgColorArray.push(pieColors[7]);
  }
  if (vuln9Count > 0) {
    dataArray.push(vuln9Count);
    bgColorArray.push(pieColors[8]);
  }
  if (vuln10Count > 0) {
    dataArray.push(vuln10Count);
    bgColorArray.push(pieColors[9]);
  }
  if (vuln11Count > 0) {
    dataArray.push(vuln11Count);
    bgColorArray.push(pieColors[10]);
  }
  if (vuln12Count > 0) {
    dataArray.push(vuln12Count);
    bgColorArray.push(pieColors[11]);
  }
  if (vuln13Count > 0) {
    dataArray.push(vuln13Count);
    bgColorArray.push(pieColors[12]);
  }
  if (vuln14Count > 0) {
    dataArray.push(vuln14Count);
    bgColorArray.push(pieColors[13]);
  }
  if (vuln15Count > 0) {
    dataArray.push(vuln15Count);
    bgColorArray.push(pieColors[14]);
  }
  if (vuln16Count > 0) {
    dataArray.push(vuln16Count);
    bgColorArray.push(pieColors[15]);
  }
  if (vuln17Count > 0) {
    dataArray.push(vuln17Count);
    bgColorArray.push(pieColors[16]);
  }
  if (vuln18Count > 0) {
    dataArray.push(vuln18Count);
    bgColorArray.push(pieColors[17]);
  }

  var data1 = {
    labels: labelsArray,
    datasets: [
      {
        label: 'Vulnerability Distribution',
        data: dataArray,
        backgroundColor: bgColorArray,

        borderWidth: 1,
      },
    ],
  };

  const vulnDistrochartOptions = {
    labels: labelsArray,
    colors: bgColorArray,
    legend: {
      position: 'bottom',
      verticalAlign: 'middle',
    },

  };

  const vulnDistroChartSeries = dataArray;


  var totalPIIs = [];


  if (activeScan) {

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 2||
        activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 5 ||
        activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 6 ||
        activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 7) {

        
        var piiFields = activeScan.vulnerabilities[i].findings;

        totalPIIs = totalPIIs.concat(piiFields);
      }
    }
  }



  const piiCounts = {};

// Count each unique PII string
totalPIIs.forEach(pii => {
    if (piiCounts[pii] !== undefined) {
        piiCounts[pii]++;
    } else {
        piiCounts[pii] = 1;
    }
});

// Extract labels and counts into separate arrays
const piiLabelsArray = Object.keys(piiCounts);
const piiDataArray = Object.values(piiCounts);


  const piichartOptions = {
    labels: piiLabelsArray,
    //colors: piiBgColorsArray,
    legend: {
      position: 'bottom',
      verticalAlign: 'middle',
    },

  };

  const piiChartSeries = piiDataArray; 


  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>

      <>

        {onLoading ?

          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%', marginTop: '2%'
          }}>

            <ShimmerTitle line={6} gap={10} variant="primary" />
          </div>

          :

          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
          }}>

            <div style={{ marginBottom: '2rem', }}>
              <h2>{activeScan.projectName}</h2>
              <hr />

              <table >

                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Scan ID </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {scanId}
                  </td>
                </tr>

                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Collection Name </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {(activeScan.theCollectionVersion && activeScan.theCollectionVersion.apiCollection.collectionName) ? 
                    activeScan.theCollectionVersion.apiCollection.collectionName : '<Name not found>'}

                  </td>
                </tr>


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Endpoints</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {activeScan.endpointsScanned}

                  </td>
                </tr>


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Vulnerabilities</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {activeScan.vulnerabilities ? (activeScan.vulnerabilities).length : '---'}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Started At</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {(new Date(activeScan.createdAt)).toLocaleDateString('en-US')} - {(new Date(activeScan.createdAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>

                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Status</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

              

        {activeScan.status == 'completed' &&
                     <span style={{backgroundColor:'#28C76F', color:'#fff', padding:10, }}>{activeScan.status.toUpperCase()}</span>
        }

       

      {activeScan.status == 'in progress' &&
                     <span style={{backgroundColor:'#FFC300', color:'#black', padding:10}}>{activeScan.status.toUpperCase()}</span>
        }

                             


                  </td>
                </tr>
              

              {activeScan.status == 'completed' &&
                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

                    <span style={{ fontWeight: 'bold',  }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(activeScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(activeScan.scanCompletedAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>
              }

              </table>



            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>

              <CButton
                onClick={goBack}
                style={{
                  width: 300,
                  marginBottom: '2%',
                  borderWidth: 0,
                  fontSize: 20,
                  borderColor: '#ffffff',
                  borderWidth: 1,
                  color: '#ffffff',
                  background: 'transparent'
                }}
                color="primary"
                className="px-3"
              >
                <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight: 10 }} /> Back to Scans List
              </CButton>

              <CButton
                onClick={downloadPDF}

                color="primary"
                className="primaryButton"
              >

                {exportingPDF ?
                  <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                  :
                  <>
                    <BiExport size={25} style={{ color: '#ffffff', marginRight: 10 }} />
                    Export to PDF
                  </>
                }

              </CButton>
            </div>
          </div>

        }



        {onLoading ?


          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%',
            marginTop: '2%',
          }}>

            <ShimmerTable row={5} col={7} />

          </div>


          :
          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
          }}>

            <h4 style={{ marginTop: 30 }}>Vulnerabilities by Severity</h4>
            <hr />

            <table style={{ width: '100%' }}>

              <thead>
                <th style={{ padding: 20, borderWidth: 2, color: '#000', borderColor: '#fff' }}>Severity</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#FF0000', borderColor: '#fff' }}>CRITICAL</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#A6001B', borderColor: '#fff' }}>HIGH</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#F6BE00', borderColor: '#fff' }}>MEDIUM</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#green', borderColor: '#fff' }}>LOW</th>
              </thead>

              <tbody>

                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}># of Issues</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfHighVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfMediumVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>

              </tbody>
            </table>


          </div>
        }


        <div style={{
          width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'column',
          marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
        }}>

          <h4 style={{ marginTop: 30 }}>Severity Scoring</h4>
          <hr />

          <span><span style={{ fontWeight: 'bold', color: '#FF0000' }}>CRITICAL</span>: Vulnerabilities that can be exploited remotely, leading to immediate and widespread impact on the confidentiality,
            integrity, and availability of systems or data.</span>

          <span style={{ marginTop: 15 }}><span style={{ fontWeight: 'bold', color: '#A6001B' }}>HIGH:</span> Vulnerabilities that can be exploited but require some form of user interaction or other
            preconditions to be met, potentially resulting in significant impact on system or data.</span>

          <span style={{ marginTop: 15 }}><span style={{ fontWeight: 'bold', color: '#F6BE00' }}>MEDIUM:</span> Vulnerabilities that could result in a compromise of system or data security,
            but require more complex exploitation techniques or have limited impact.</span>

          <span style={{ marginTop: 15 }}><span style={{ fontWeight: 'bold', color: 'green' }}>LOW:</span> Vulnerabilities that have a low likelihood of being exploited or have minimal impact on system or data security.</span>





        </div>




        {onLoading == true && page==0 ?

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 50 }}>

            <ShimmerCircularImage size={500} />
            <ShimmerCircularImage size={500} />


          </div>
          :

          <>

            {vulnDistroChartSeries.length > 0 && piiChartSeries.length > 0 &&


              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 100, height: 600 }}>




                <div style={{
                  width: '100%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'column',
                  marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
                }}>

                  <h4 style={{ color: '#000', textAlign: 'center' }}>Vulnerability Distribution</h4>
                  <hr />


                  <Chart options={vulnDistrochartOptions} series={vulnDistroChartSeries} type="pie" />

                </div>




                <div style={{
                  width: '100%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'column',
                  marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
                }}>

                  <h4 style={{ color: '#000', textAlign: 'center' }}>Sensitive Data</h4>
                  <hr />


                  <Chart options={piichartOptions} series={piiChartSeries} type="donut" />


                </div>


              </div>
            }


            {vulnDistroChartSeries.length > 0 && piiChartSeries.length == 0 &&

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 50, height: 600 }}>


                <div style={{
                  width: '30%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'column',
                  marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
                }}>

                  <h4 style={{ color: '#000', textAlign: 'center' }}>Vulnerability Distribution</h4>
                  <hr />

                  <Chart options={vulnDistrochartOptions} series={vulnDistroChartSeries} type="pie" />

                </div>
              </div>
            }


            {vulnDistroChartSeries.length == 0 && piiChartSeries.length > 0 &&

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 50, height: 600 }}>


                <div style={{
                  width: '30%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'column',
                  marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
                }}>

                  <h4 style={{ color: '#000', textAlign: 'center' }}>Sensitive Data</h4>
                  <hr />

                  <Chart options={piichartOptions} series={piiChartSeries} type="donut" />


                </div>
              </div>
            }



          </>

        }





        <div style={{
          width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'column',
          marginTop: '2%'
        }}>

          {onLoading &&
            <ShimmerTable row={8} col={10} />

          }


          {!onLoading &&

            <>

              {tableData.length > 0 &&

                <ThemeProvider theme={getMuiTheme()}>
                  <MUIDataTable
                    style={{ height: "57vh" }}
                    data={tableData}
                    columns={columns}
                    options={options}
                  />
                </ThemeProvider>
              }

            </>


          }

        </div>


        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Remediations"
        >

          <button style={{ float: 'right', backgroundColor: 'transparent', borderWidth: 0 }} onClick={closeModal} >
            <AiFillCloseCircle size={30} color={'#000'} />
          </button>

          {currentVulnerability && currentVulnerability.vulnerability &&

            <div className="modalWindow" style={{ backgroundColor: '#E1E1E1' }}>


              <h5 style={{ color: '#000' }}><strong>Vulnerability Name</strong>: {currentVulnerability.vulnerability.vulnerabilityName}</h5>
              <h5 style={{ color: '#000' }}><strong>Severity</strong>: {currentVulnerability.severity}</h5>

              <hr />

              <h5 style={{ color: '#000' }}>Remediations</h5>
              <hr />



              <div dangerouslySetInnerHTML={{__html:currentVulnerability.remediation}}  style={{ color: '#000' }}></div>

              

            </div>
          }


        </Modal>

        <Modal
          isOpen={acceptanceModalIsOpen}
          onRequestClose={closeAcceptanceModal}
          style={customStyles1}
          contentLabel="Risk Acceptance"
          ariaHideApp={false}
    >
      <button style={{ float: 'right', backgroundColor: 'transparent', borderWidth: 0 }} onClick={closeAcceptanceModal}>
        <AiFillCloseCircle size={30} color={'#000'} />
      </button>

      {currentVulnForRiskAcceptance && (
        <div className="modalWindow" style={{ backgroundColor: '#fff', padding:10 }}>
          <h5 style={{ color: '#000' }}>{currentVulnForRiskAcceptance.vulnerability.vulnerabilityName}</h5>
          <hr/>
          <span style={{ color: '#000' }}><strong>Endpoint</strong> : {currentVulnForRiskAcceptance.endpoint.url}</span>
          <div style={{ marginTop: 20 }}>
            <label>Risk Accepted?</label><br/>
            <select onChange={handleDropdownChange} style={{ padding:5, width:'100%'}} value={riskAcceptance}>              
                <option value="No">No</option>
                <option value="Yes">Yes</option>
            </select>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please enter a reason"
              style={{ width: '100%', marginTop: '10px', padding:5 }}
            />

{reasonEmptyError &&
            <span style={{color:'red', fontSize:12, display:'flex'}}>Please enter a reason</span>
}

            <button className="primaryButton" disabled={submittingReason}
                    onClick={handleAcceptanceSave} 
                    style={{borderRadius:5, marginTop:10}}>
                      Save Risk Acceptance
            </button>
          </div>
        </div>
      )}
    </Modal>



    <Modal
          isOpen={costOfBreachModalIsOpen}
          onRequestClose={closeCostOfBreachModal}
          style={customStyles2}
          contentLabel="Cost of Breach"
        >

          <button style={{ float: 'right', backgroundColor: 'transparent', borderWidth: 0 }} onClick={closeCostOfBreachModal} >
            <AiFillCloseCircle size={30} color={'#000'} />
          </button>

          {currentVulnerability && currentVulnerability.vulnerability &&

            <div className="modalWindow" style={{ backgroundColor: '#c2eef4', height:'100%' }}>

            <h4>Cost of Breach for <strong>{currentVulnerability.vulnerability.owasp[0]}</strong></h4>


        {currentVulnerability.vulnerability.owasp.includes('API1:2023 Broken Object Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenObjectLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.vulnerability.owasp.includes('API2:2023 Broken Authentication') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API3:2023 Broken Object Property Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenObjectPropertyLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API4:2023 Unrestricted Resource Consumption') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unrestrictedResourceConsumption.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API5:2023 Broken Function Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenFunctionLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp[0] == 'API6:2023 Unrestricted Access to Sensitive Business Flows' &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unrestrictedAccessToSensitiveBusinessFlows.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API7:2023 Server Side Request Forgery') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/serverSideRequestForgery.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API8:2023 Security Misconfiguration') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/securityMisconfiguration.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API9:2023 Improper Inventory Management') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/improperInventoryManagement.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.vulnerability.owasp.includes('API10:2023 Unsafe Consumption of APIs') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unsafeConsumptionOfAPIs.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }                

            </div>
          }


        </Modal>        



        <Modal
          isOpen={findingsModalIsOpen}
          onRequestClose={closeFindingsModal}
          style={customStyles2}
          contentLabel="Findings"
        >

          <button style={{ float: 'right', backgroundColor: 'transparent', borderWidth: 0 }} onClick={closeFindingsModal} >
            <AiFillCloseCircle size={30} color={'#000'} />
          </button>

          {/* Security headers not enabled on host */}
          {currentVulnerability && currentVulnerability.vulnerability && currentVulnerability.vulnerability.vulnerabilityCode == 10 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Missing Headers</h4>
           <hr/>
         
            {findings && findings.map((item, index) => (

              <div style={{backgroundColor:'#fff', marginBottom:20, padding:10}}>
                <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: convertHeaderString(item) }}
                    style={{
                        padding: 0,
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: 10,
                        fontSize: 17,
                        fontWeight: 'normal',
                        marginRight: 5,
                        color: '#000',
                        backgroundColor: 'transparent',
                        margin: 0
                    }}
                />

{(getHeaderDescAndExploitability(item)).description !== '' &&
<>
            <span>
            <br/>
                    <strong>Description:</strong>{(getHeaderDescAndExploitability(item)).description}
                  </span> <br/>
                  <span>
                  <strong>Exploitability:</strong>{(getHeaderDescAndExploitability(item)).exploitability}
                  </span>

                  </>
}

                  </div>

            ))}
        </div>      
        }


        {/* HTTP Verb tampering possible */}
        {currentVulnerability && currentVulnerability.vulnerability && currentVulnerability.vulnerability.vulnerabilityCode == 8 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Methods on which HTTP Verb Tampering is possible</h4>
           <hr/>
         
            {findings && findings.map((item, index) => (
                <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: convertHeaderString(item) }}
                    style={{
                        padding: 5,
                        width: '80%',
                        textAlign: 'left',
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 'normal',
                        marginRight: 5,
                        color: '#000',
                        backgroundColor: '#fff',
                        margin: 5
                    }}
                />
            ))}
        </div>      
        }


         {/* Endpoint not secure by SSL */}
         {currentVulnerability && currentVulnerability.vulnerability && currentVulnerability.vulnerability.vulnerabilityCode == 4 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>SSL related issues on the host</h4>
           <hr/>
         
            {sslFindings && sslFindings.map((item, index) => (

                <div style={{marginTop:20, background:'#fff', padding:10, borderRadius:10}}>

                  <span>
                    <strong>Description:</strong>{item.description}
                  </span> <br/><br/>
                  <span>
                  <strong>Exploitability:</strong>{item.exploitability}
                  </span>

                </div>
            ))}
        </div>      
        }


        {/* Sensitive data in query params */}
        {currentVulnerability && currentVulnerability.vulnerability && currentVulnerability.vulnerability.vulnerabilityCode == 6 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Sensitive data found in query params</h4>
           <hr/>
         
            {findings && findings.map((item, index) => (
                <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: convertHeaderString(item) }}
                    style={{
                        padding: 5,
                        width: '25%',
                        textAlign: 'center',
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 'normal',
                        marginRight: 5,
                        color: '#000',
                        backgroundColor: '#fff',
                        margin: 5
                    }}
                />
            ))}
        </div>      
        }


        {/* Sensitive data in path params */}
        {currentVulnerability && currentVulnerability.vulnerability && currentVulnerability.vulnerability.vulnerabilityCode == 2 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Sensitive data found in path params</h4>
           <hr/>
         
            {findings && findings.map((item, index) => (
                <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: convertHeaderString(item) }}
                    style={{
                        padding: 5,
                        width: '80%',
                        textAlign: 'left',
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 'normal',
                        marginRight: 5,
                        color: '#000',
                        backgroundColor: '#fff',
                        margin: 5
                    }}
                />
            ))}
        </div>      
        }    
          


        </Modal>        

      </>

    </div>
  )
}

export default ViewQuickScanReport



