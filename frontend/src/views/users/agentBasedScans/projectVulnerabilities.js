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
import { CiEdit } from "react-icons/ci";

import Chart from 'react-apexcharts'

const ProjectVulnerabilities = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [result, setResult] = useState(null)
  const [project, setProject] = useState(null)
  const [onLoading, setOnLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [findingsModalIsOpen, setFindingsModalIsOpen] = React.useState(false);
  const [currentVulnerability, setCurrentVulnerability] = React.useState(null);

  const [exportingPDF, setExportingPDF] = useState(false);

  const [currentVulnForRiskAcceptance, setCurrentVulnForRiskAcceptance] = React.useState(null);

  const [reasonEmptyError, setReasonEmptyError] = useState(false);

  const [findings, setFindings] = useState([]);
  const [sslFindings, setSSLFindings] = useState([]);

  const [submittingReason, setSubmittingReason] = useState(false);

  const [acceptanceModalIsOpen, setAcceptanceModalIsOpen] = useState(false);
  const [riskAcceptance, setRiskAcceptance] = useState("No");
  const [reason, setReason] = useState('');

  const [costOfBreachModalIsOpen, setCostOfBreachModalIsOpen] = React.useState(false);

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


  const handleModalClose = () => {
    //setShowModal(false);
  };

  const handleDropdownChange = (event) => {

    console.log('event.target.value:',event.target.value)
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
    height: '80%',
    overflowY: 'auto'
  }
};

const customStyles2 = {
  content: {
    top: '10%',
    left: '20%',
    width: '70%',
    right: 'auto',
    bottom: 'auto',
    maxHeight: '80%',
    height: '80%',
    backgroundColor: '#c2eef4',
    borderRadius: 15,
    borderColor: 'yellow',
    zIndex: 10000
  },
};


const openCostOfBreachModal = async (value) => {

  setCurrentVulnerability(value);

  setCostOfBreachModalIsOpen(true);
};



const closeCostOfBreachModal = async () => {

  setCostOfBreachModalIsOpen(false);
};

const closeAcceptanceModal = async () => {

  setAcceptanceModalIsOpen(false);

};

  const handleAcceptanceSave = async() => {

    if(reason == ''){
      setReasonEmptyError(true);

    }else{

      setSubmittingReason(true);    

      const data = {
        vulnId: currentVulnForRiskAcceptance._id,
        riskAcceptance:riskAcceptance,
        riskAcceptanceReason:reason
      };


      const token = localStorage.getItem('ASIToken');
      const response = await axios.post('api/v1/users/updateRiskAcceptanceForAMirroringAgent', data, {
          headers: { Authorization: `Bearer ${token}` },
      });

      console.log('response.data.data:',response.data.data)

      if(response.data.data){

        setResult((prevState) => ({
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

    var theProjectId = arr[1];

    loadProjectVulnerabilities(theProjectId);

  }, []);

  useEffect(() => {
    //console.log('onLoading', onLoading)

  }, [onLoading]);

  
  const openFindingsModal = async (value, currentVuln) => {

    console.log('value:',value)
    console.log('currentVuln:',currentVuln)

    setFindings(value);

    if(currentVuln.vulnerability.vulnerabilityCode == 4){
        setSSLFindings(currentVuln.sslFindings);
    }

    setCurrentVulnerability(currentVuln.vulnerability)

    setFindingsModalIsOpen(true);
  };

  const closeFindingsModal = async () => {

    setFindingsModalIsOpen(false);
  };


  const loadProjectVulnerabilities = async (projectId) => {

    setOnLoading(true);
  
    const queryParams = new URLSearchParams({ projectId }).toString();
    const url = `api/v1/mirroredScans/getProjectVulnerabilities?${queryParams}`;
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setResult(response.data);
    setOnLoading(false);
  };  


  const openRemediationModal = async (value) => {

    console.log('value', value)

    setCurrentVulnerability(value);

    setModalIsOpen(true);
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };

  const goBack = async () => {

    navigate('/agents');
  }

  const downloadPDF = async (e) => {

    e.preventDefault();
     
    const urlToOpen = global.reportAPIURL + project._id+'/'+project.user._id; 
    window.open(urlToOpen, '_blank');   

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


{value.vulnerability.vulnerabilityCode !== 3 &&
           
              <CButton color="primary" variant="outline"
                onClick={() => openFindingsModal(value.findings, value)}
                className="primaryButton" style={{ fontSize: 13, color: 'white', width:200 }}>

                  {value.vulnerability.vulnerabilityCode == 10 &&
                  'View Missing Headers'
                  }

                  {value.vulnerability.vulnerabilityCode == 4 &&
                  'View SSL Problems'
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
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              alignItems: "center",
              flexDirection:'column',
            }} >

              {value.riskAcceptance && value.riskAcceptance == 'Yes' ?

                <span style={{backgroundColor:'#28c76f', color:'#fff', padding: 5,
                width: 120,
                textAlign: 'center',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 'normal',
                marginRight: 5,                
                margin:5}} onClick={() => handleModalOpen(value)}>Yes  &nbsp;&nbsp;&nbsp;<CiEdit size={20}/></span>
                :
                <span style={{backgroundColor:'#ea5455', color:'#fff', padding: 5,
                width: 120,
                textAlign: 'center',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 'normal',
                marginRight: 5,                
                margin:5}} onClick={() => handleModalOpen(value)}>No  &nbsp;&nbsp;&nbsp;<CiEdit size={20}/></span>
              }
              
            </div>
          )
        }
      }
    },

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
    selectableRows: false, // <===== will turn off checkboxes in rows
    rowsPerPage: 20,
    rowsPerPageOptions: [],
  };


  var tableData = [];
  
  var uniqueEndpoints = [];

  if (result && result.vulnerabilities) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);
      dataItem.push(result.vulnerabilities[i].vulnerability.vulnerabilityName);

      var endpointObject = result.vulnerabilities[i].endpoint;

      console.log('endpointObject:',endpointObject)

      var tmp = separateHostAndEndpoint(endpointObject);

      const endpointPart = tmp.endpoint.split('?')[0]; // Get the part before the '?'
if (!uniqueEndpoints.includes(endpointPart)) {
  uniqueEndpoints.push(endpointPart);
}

      console.log('tmp:',tmp)

      if (endpointObject) {
        dataItem.push(tmp.host);
        dataItem.push(tmp.endpoint);
      } else {
        dataItem.push('---');
        dataItem.push('---');
      }


      
      let isAuthenticated = false;

      // Check if authorization type is 'None' or if any header has key as "Authorization"
      if (endpointObject.headers && endpointObject.headers.some(header => header.key === 'Authorization')) {
        isAuthenticated = true;
      }else{
        isAuthenticated = false;
      }

      // Push appropriate value based on isAuthenticated
      if (isAuthenticated) {
        dataItem.push('Authenticated');
      } else {
        dataItem.push('Unauthenticated');
      }
      


      dataItem.push(result.vulnerabilities[i].description);

      dataItem.push(result.vulnerabilities[i]);

      dataItem.push(result.vulnerabilities[i].severity);

      dataItem.push(result.vulnerabilities[i].vulnerability.owasp);
      
      dataItem.push((result.vulnerabilities[i].vulnerability.cwe).concat(result.vulnerabilities[i].additionalCWEs));

      dataItem.push(result.vulnerabilities[i]); // for cost of breach
      dataItem.push(result.vulnerabilities[i]); // for remediations

      dataItem.push(result.vulnerabilities[i]); // For risk acceptance

      tableData.push(dataItem);
    }
  }


  var numOfHighVulns = 0
  var numOfMediumVulns = 0;
  var numOfLowVulns = 0
  var numOfCriticalVulns = 0;


  if (result) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      if (result.vulnerabilities[i].severity == 'HIGH') {
        numOfHighVulns++;
      }

      if (result.vulnerabilities[i].severity == 'MEDIUM') {
        numOfMediumVulns++;
      }

      if (result.vulnerabilities[i].severity == 'LOW') {
        numOfLowVulns++;
      }

      if (result.vulnerabilities[i].severity == 'CRITICAL') {
        numOfCriticalVulns++;
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

  if (result) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 1) {
        vuln1Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 2) {
        vuln2Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 3) {
        vuln3Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 4) {
        vuln4Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 5) {
        vuln5Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 6) {
        vuln6Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 7) {
        vuln7Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 8) {
        vuln8Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 9) {
        vuln9Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 10) {
        vuln10Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 11) {
        vuln11Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 12) {
        vuln12Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 13) {
        vuln13Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 14) {
        vuln14Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 15) {
        vuln15Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 16) {
        vuln16Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 17) {
        vuln17Count++;
      }

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 18) {
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
    chart: {
      width: '100%',
      height: '100%',
    },
  };

  const vulnDistroChartSeries = dataArray;   


  var totalPIIs = [];

  
  if (result) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 6 || result.vulnerabilities[i].vulnerability.vulnerabilityCode == 2) {

        var piiFields = result.vulnerabilities[i].findings;
        totalPIIs = totalPIIs.concat(piiFields);

        console.log('piiFields', piiFields)           
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




  var data2 = {

    labels: piiLabelsArray,
    datasets: [
      {
        label: 'Sensitive Data',
        data: piiDataArray,
        //backgroundColor: piiBgColorsArray,
        borderWidth: 1,
      },
    ],
  };


  const piichartOptions = {
    labels: piiLabelsArray,
    //colors: piiBgColorsArray,
    legend: {
      position: 'bottom',
      verticalAlign: 'middle',
    },
    chart: {
      width: '100%',
      height: '100%',
    },
  };

  const piiChartSeries = piiDataArray;   

  console.log('piiChartSeries:',piiChartSeries)


  function separateHostAndEndpoint(url) {
    try {
      // Create a new URL object
      const urlObj = new URL(url);
      
      // Extract host and endpoint
      const host = urlObj.hostname;
      const endpoint = urlObj.pathname + urlObj.search + urlObj.hash;
  
      // Return the result
      return { host, endpoint };
    } catch (error) {
      // Handle invalid URLs
      console.error("Invalid URL", error);
      return null;
    }
  }
 

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <>

        {onLoading ?

          <div style={{
            width: '90%', marginLeft: '5%', marginRight: '5%', marginTop: '2%'
          }}>

            <ShimmerTitle line={6} gap={10} variant="primary" />
          </div>

          :

          <div style={{
            width: '90%', marginLeft: '5%', marginRight: '5%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background:'#fff', padding: 20, borderRadius: 15
          }}>

            <div style={{ marginBottom: '2rem', }}>
              <h2>{result.projectName}</h2>
              <hr/>

              <table>   


              <tr>

<td style={{padding:10, borderWidth:0, borderColor:'#000', background:'transparent'}}>

  <span style={{ fontWeight: 'bold',  }}>Application ID</span>

</td>
<td style={{padding:10, borderWidth:1, borderColor:'#ffffff'}}>

{result.projectId}

</td>
</tr>  



              <tr>

<td style={{padding:10, borderWidth:0, borderColor:'#000', background:'transparent'}}>

  <span style={{ fontWeight: 'bold',  }}>Endpoints</span>

</td>
<td style={{padding:10, borderWidth:1, borderColor:'#ffffff'}}>

{uniqueEndpoints.length}

</td>
</tr>  
                        

                <tr>

                  <td style={{padding:10, borderWidth:0, borderColor:'#000', background:'transparent'}}>

                    <span style={{ fontWeight: 'bold',  }}>Vulnerabilities</span>

                  </td>
                  <td style={{padding:10, borderWidth:1, borderColor:'#ffffff'}}>

                  {result.vulnerabilities ? (result.vulnerabilities).length : '---'}

                  </td>
                </tr>  
                

              </table>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>

              <CButton
                onClick={goBack}
                
                color="primary"
                className="primaryOutlineButton"
              >
                <IoMdArrowRoundBack size={25} style={{ color: '#7366ff', marginRight: 10 }} /> <span className="primaryOutlineButtonText">
                  Back to Applications</span>
              </CButton>

              <CButton
                onClick={downloadPDF}                
                color="primary"
                className="primaryButton"
                style={{marginTop:10}}
              >

                {exportingPDF ?
                  <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                  :
                  <>
                    <BiExport size={25} style={{ color: '#ffffff', marginRight: 10 }} />
                    <span className="primaryButtonText">Export to PDF</span>
                  </>
                }

              </CButton>

              
            </div>
          </div>

        }



        {onLoading ?


          <div style={{
            width: '90%', marginLeft: '5%', marginRight: '5%',
            marginTop: '2%',
          }}>

            <ShimmerTable row={5} col={7} />


          </div>


          :
          <div style={{
            width: '90%', marginLeft: '5%', marginRight: '5%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background:'#fff', padding: 20, borderRadius: 15
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
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfCriticalVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfHighVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfMediumVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfLowVulns}</th>

              </tbody>
            </table>


          </div>
        }


        <div style={{
          width: '90%', marginLeft: '5%', marginRight: '5%', display: 'flex', flexDirection: 'column',
          marginTop: '2%', background:'#fff', padding: 20, borderRadius: 15
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



{onLoading &&

<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 100 }}>

<ShimmerCircularImage size={500} />
<ShimmerCircularImage size={500} />


</div>
}
          {(vulnDistroChartSeries.length > 0 && piiChartSeries.length > 0) &&


            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 100 }}>


              {vulnDistroChartSeries.length > 0 &&

                <div style={{width:'30%'}}>

                  <h5 style={{ color: '#000', textAlign: 'center' }}>Vulnerability Distribution</h5>  
                  <hr/>                

                  <Chart options={vulnDistrochartOptions} series={vulnDistroChartSeries} type="pie" width="100%"/>

                </div>
              }

              {piiChartSeries.length > 0 &&

                <div style={{width:'30%'}}>

                  <h5 style={{ color: '#000', textAlign: 'center' }}>Sensitive Data</h5>
                  <hr/> 
                  <Chart options={piichartOptions} series={piiChartSeries} type="pie" width="100%" />

                </div>
              }

            </div>

          }

        </div>


        <div style={{
          width: '90%', marginLeft: '5%', marginRight: '5%', display: 'flex', flexDirection: 'column',
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
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.vulnerability.owasp.includes('API2:2023 Broken Authentication') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API3:2023 Broken Object Property Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API4:2023 Unrestricted Resource Consumption') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API5:2023 Broken Function Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp[0] == 'API6:2023 Unrestricted Access to Sensitive Business Flows' &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API7:2023 Server Side Request Forgery') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API8:2023 Security Misconfiguration') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.vulnerability.owasp.includes('API9:2023 Improper Inventory Management') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.vulnerability.owasp.includes('API10:2023 Unsafe Consumption of APIs') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
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
          {currentVulnerability && currentVulnerability.vulnerabilityCode == 10 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Missing Headers</h4>
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


        {/* HTTP Verb tampering possible */}
        {currentVulnerability && currentVulnerability.vulnerabilityCode == 8 &&
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
         {currentVulnerability && currentVulnerability.vulnerabilityCode == 4 &&
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
        {currentVulnerability && currentVulnerability.vulnerabilityCode == 6 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Sensitive data found in query params</h4>
           <hr/>
         
            {findings && findings.map((item, index) => (
                <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: convertHeaderString(item) }}
                    style={{
                        padding: 5,
                        width: '20%',
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


        {/* Sensitive data in path params */}
        {currentVulnerability && currentVulnerability.vulnerabilityCode == 2 &&
          <div style={{display:'flex', flexDirection:'column'}} >

           <h4>Sensitive data found in path params</h4>
           <hr/>
         
            {findings && findings.map((item, index) => (
                <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: convertHeaderString(item) }}
                    style={{
                        padding: 5,
                        width: '20%',
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

export default ProjectVulnerabilities