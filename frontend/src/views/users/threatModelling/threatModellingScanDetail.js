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

const ThreatModellingScanDetail = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [activeScan, setActiveScan] = useState(null)
  const [onLoading, setOnLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [currentVulnerability, setCurrentVulnerability] = React.useState(null);

  const [threatModellingModalIsOpen, setThreatModellingModalIsOpen] = React.useState(false);
  const [costOfBreachModalIsOpen, setCostOfBreachModalIsOpen] = React.useState(false);
  
  const [currentVulnForRiskAcceptance, setCurrentVulnForRiskAcceptance] = React.useState(null);

  const [exportingPDF, setExportingPDF] = useState(false);
  const [reasonEmptyError, setReasonEmptyError] = useState(false);

  const [submittingReason, setSubmittingReason] = useState(false);

  const [acceptanceModalIsOpen, setAcceptanceModalIsOpen] = useState(false);
  const [riskAcceptance, setRiskAcceptance] = useState("No");
  const [reason, setReason] = useState('');

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
    height:'80%',
    overflowY: 'auto'
  }
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

    loadScanDetails(theScanId);

  }, []);

  useEffect(() => {

  }, [onLoading]);


  const loadScanDetails = async (theScanId) => {

    const data = {
      scanId: theScanId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.post('api/v1/activeScans/getActiveScanDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setActiveScan(response.data.activeScan);

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

  const closeModal = async () => {

    setModalIsOpen(false);
  };



  const openThreatModellingModal = async (value) => {

    setCurrentVulnerability(value);

    setThreatModellingModalIsOpen(true);
  };

  const openCostOfBreachModal = async (value) => {

    setCurrentVulnerability(value);

    setCostOfBreachModalIsOpen(true);
  };

  const closeThreatModellingModal = async () => {

    setThreatModellingModalIsOpen(false);
  };

  const closeCostOfBreachModal = async () => {

    setCostOfBreachModalIsOpen(false);
  };

  const closeAcceptanceModal = async () => {

    console.log('comes')
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
                className="primaryButton" style={{ fontSize: 13, color: 'white',width:200 }}>View Remediations
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
      label: "Threat Modelling",
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
                onClick={() => openThreatModellingModal(value)}
                className="primaryButton" style={{ fontSize: 13, width:200,
                 color: 'white', backgroundColor:'#444', borderColor:'#444' }}>View Threat Modelling
              </CButton>

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
    textLabels: {
      body: {
        noMatch: 'No vulnerabilities found',
      }
    }
  };


  var tableData = [];

  if (activeScan && activeScan.vulnerabilities) {

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);
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
      dataItem.push(activeScan.vulnerabilities[i].vulnerability.riskScore);

      dataItem.push(activeScan.vulnerabilities[i].vulnerability.owasp);
      dataItem.push(activeScan.vulnerabilities[i].vulnerability.cwe);

      dataItem.push(activeScan.vulnerabilities[i].vulnerability); // For remediation


      dataItem.push(activeScan.vulnerabilities[i].vulnerability); // For cost of breach
      dataItem.push(activeScan.vulnerabilities[i].vulnerability); // For threat modelling


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


  var nameCount = 0;
  var addressCount = 0;
  var phoneCount = 0;
  var ipCount = 0;
  var macCount = 0;
  var ssnCount = 0;
  var passportNumCount = 0;
  var dlCount = 0;
  var bankAccountNumCount = 0;
  var creditDebitCardNumCount = 0;
  var panNumCount = 0;
  var aadhaarNumCount = 0;
  var voterIDNumCount = 0;
  var vehicleRegistrationNumCount = 0;
  var dobCount = 0;
  var pobCount = 0;
  var raceCount = 0;
  var religionCount = 0;
  var weightCount = 0;
  var heightCount = 0;
  var latitudeCount = 0;
  var longitudeCount = 0;
  var employeeIDCount = 0;
  var bmiCount = 0;
  var heartRateCount = 0;
  var bloodPressureCount = 0;
  var fatherNameCount = 0;
  var motherNameCount = 0;
  var brotherNameCount = 0;
  var sisterNameCount = 0;
  var daughterNameCount = 0;
  var sonNameCount = 0;
  var orderIDCount = 0;
  var transactionIDCount = 0;
  var cookieDataCount = 0;


  if (activeScan) {

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

      if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 6) {

        var endpoint = activeScan.vulnerabilities[i].endpoint;
        var piiFields = endpoint.piiFields;


        if (piiFields.includes("Name")) {
          nameCount++;
        }

        if (piiFields.includes("Address")) {
          addressCount++;
        }

        if (piiFields.includes("Phone Number")) {
          phoneCount++;
        }

        if (piiFields.includes("Internet Protocol (IP)")) {
          ipCount++;
        }

        if (piiFields.includes("Media Access Control (MAC)")) {
          macCount++;
        }

        if (piiFields.includes("Social Security Number (SSN)")) {
          ssnCount++;
        }

        if (piiFields.includes("Passport Number")) {
          passportNumCount++;
        }

        if (piiFields.includes("Driving License Number")) {
          dlCount++;
        }

        if (piiFields.includes("Bank Account Number")) {
          bankAccountNumCount++;
        }

        if (piiFields.includes("Credit/Debit Card Number")) {
          creditDebitCardNumCount++;
        }

        if (piiFields.includes("PAN Number")) {
          panNumCount++;
        }

        if (piiFields.includes("Aadhaar Number")) {
          aadhaarNumCount++;
        }

        if (piiFields.includes("Voter ID Number")) {
          voterIDNumCount++;
        }

        if (piiFields.includes("Vehicle Registration Number")) {
          vehicleRegistrationNumCount++;
        }

        if (piiFields.includes("Date of Birth")) {
          dobCount++;
        }

        if (piiFields.includes("Place of Birth")) {
          pobCount++;
        }

        if (piiFields.includes("Race")) {
          raceCount++;
        }

        if (piiFields.includes("Religion")) {
          religionCount++;
        }

        if (piiFields.includes("Weight")) {
          weightCount++;
        }

        if (piiFields.includes("Height")) {
          heightCount++;
        }

        if (piiFields.includes("Latitude")) {
          latitudeCount++;
        }

        if (piiFields.includes("Longitude")) {
          longitudeCount++;
        }

        if (piiFields.includes("Employee ID")) {
          employeeIDCount++;
        }

        if (piiFields.includes("BMI")) {
          bmiCount++;
        }

        if (piiFields.includes("Heart Rate")) {
          heartRateCount++;
        }

        if (piiFields.includes("Blood Pressure")) {
          bloodPressureCount++;
        }

        if (piiFields.includes("Father Name")) {
          fatherNameCount++;
        }

        if (piiFields.includes("Mother Name")) {
          motherNameCount++;
        }

        if (piiFields.includes("Brother Name")) {
          brotherNameCount++;
        }

        if (piiFields.includes("Sister Name")) {
          sisterNameCount++;
        }

        if (piiFields.includes("Daughter Name")) {
          daughterNameCount++;
        }

        if (piiFields.includes("Son Name")) {
          sonNameCount++;
        }

        if (piiFields.includes("Order ID")) {
          orderIDCount++;
        }

        if (piiFields.includes("Transaction ID")) {
          transactionIDCount++;
        }

        if (piiFields.includes("Cookie Data")) {
          cookieDataCount++;
        }
      }
    }
  }


  var piiLabelsArray = [];
  var piiDataArray = [];
  var piiBgColorsArray = [];

  const pieColors1 = [
    '#FF5733', '#33A02C', '#1F77B4', '#FF8C00', '#32CD32',
    '#6495ED', '#FF4500', '#228B22', '#4169E1', '#FF6347',
    '#7CFC00', '#8A2BE2', '#FFD700', '#00FFFF', '#FF1493',
    '#ADFF2F', '#A0522D', '#20B2AA', '#FF69B4', '#F4A460',
    '#9400D3', '#00CED1', '#E9967A', '#2E8B57', '#8B008B',
    '#00FA9A', '#8B0000', '#9932CC', '#2F4F4F', '#FFD700',
    '#40E0D0', '#7B68EE', '#32CD32', '#FF4500', '#D8BFD8'
  ];


  if (nameCount > 0) {
    piiLabelsArray.push('Name');
    piiDataArray.push(nameCount);
    piiBgColorsArray.push(pieColors1[0]);
  }
  //
  if (addressCount > 0) {
    piiLabelsArray.push('Address');
    piiDataArray.push(addressCount);
    piiBgColorsArray.push(pieColors1[1]);
  }
  //
  if (phoneCount > 0) {
    piiLabelsArray.push('Phone');
    piiDataArray.push(phoneCount);
    piiBgColorsArray.push(pieColors1[2]);
  }
  //
  if (ipCount > 0) {
    piiLabelsArray.push('IP Address');
    piiDataArray.push(ipCount);
    piiBgColorsArray.push(pieColors1[3]);
  }
  //
  if (macCount > 0) {
    piiLabelsArray.push('MAC Address');
    piiDataArray.push(macCount);
    piiBgColorsArray.push(pieColors1[4]);
  }
  //
  if (ssnCount > 0) {
    piiLabelsArray.push('SSN');
    piiDataArray.push(ssnCount);
    piiBgColorsArray.push(pieColors1[5]);
  }
  //
  if (passportNumCount > 0) {
    piiLabelsArray.push('Passport Num');
    piiDataArray.push(passportNumCount);
    piiBgColorsArray.push(pieColors1[6]);
  }
  //
  if (dlCount > 0) {
    piiLabelsArray.push('DL Num');
    piiDataArray.push(dlCount);
    piiBgColorsArray.push(pieColors1[7]);
  }
  //
  if (bankAccountNumCount > 0) {
    piiLabelsArray.push('Bank Account Num');
    piiDataArray.push(bankAccountNumCount);
    piiBgColorsArray.push(pieColors1[8]);
  }
  //
  if (creditDebitCardNumCount > 0) {
    piiLabelsArray.push('Credit/Debit Card Num');
    piiDataArray.push(creditDebitCardNumCount);
    piiBgColorsArray.push(pieColors1[9]);
  }
  //
  if (panNumCount > 0) {
    piiLabelsArray.push('PAN Num');
    piiDataArray.push(panNumCount);
    piiBgColorsArray.push(pieColors1[10]);
  }
  //
  if (aadhaarNumCount > 0) {
    piiLabelsArray.push('Aadhaar Num');
    piiDataArray.push(aadhaarNumCount);
    piiBgColorsArray.push(pieColors1[11]);
  }
  //
  if (voterIDNumCount > 0) {
    piiLabelsArray.push('Voter ID Num');
    piiDataArray.push(voterIDNumCount);
    piiBgColorsArray.push(pieColors1[12]);
  }
  //
  if (vehicleRegistrationNumCount > 0) {
    piiLabelsArray.push('Vehicle Registration Num');
    piiDataArray.push(vehicleRegistrationNumCount);
    piiBgColorsArray.push(pieColors1[13]);
  }
  //
  if (dobCount > 0) {
    piiLabelsArray.push('DOB');
    piiDataArray.push(dobCount);
    piiBgColorsArray.push(pieColors1[14]);
  }
  //
  if (pobCount > 0) {
    piiLabelsArray.push('Place of Birth');
    piiDataArray.push(pobCount);
    piiBgColorsArray.push(pieColors1[15]);
  }
  //
  if (raceCount > 0) {
    piiLabelsArray.push('Race');
    piiDataArray.push(raceCount);
    piiBgColorsArray.push(pieColors1[16]);
  }
  //
  if (religionCount > 0) {
    piiLabelsArray.push('Religion');
    piiDataArray.push(religionCount);
    piiBgColorsArray.push(pieColors1[17]);
  }
  //
  if (weightCount > 0) {
    piiLabelsArray.push('Weight');
    piiDataArray.push(weightCount);
    piiBgColorsArray.push(pieColors1[18]);
  }
  //
  if (heightCount > 0) {
    piiLabelsArray.push('Height');
    piiDataArray.push(heightCount);
    piiBgColorsArray.push(pieColors1[19]);
  }
  //
  if (latitudeCount > 0) {
    piiLabelsArray.push('Latitude');
    piiDataArray.push(latitudeCount);
    piiBgColorsArray.push(pieColors1[20]);
  }
  //
  if (longitudeCount > 0) {
    piiLabelsArray.push('Longitude');
    piiDataArray.push(longitudeCount);
    piiBgColorsArray.push(pieColors1[21]);
  }
  //
  if (employeeIDCount > 0) {
    piiLabelsArray.push('Employee ID');
    piiDataArray.push(employeeIDCount);
    piiBgColorsArray.push(pieColors1[22]);
  }
  //
  if (bmiCount > 0) {
    piiLabelsArray.push('BMI');
    piiDataArray.push(bmiCount);
    piiBgColorsArray.push(pieColors1[23]);
  }
  //
  if (heartRateCount > 0) {
    piiLabelsArray.push('Heart Rate');
    piiDataArray.push(heartRateCount);
    piiBgColorsArray.push(pieColors1[24]);
  }
  //
  if (bloodPressureCount > 0) {
    piiLabelsArray.push('Blood Pressure');
    piiDataArray.push(bloodPressureCount);
    piiBgColorsArray.push(pieColors1[25]);
  }
  //
  if (fatherNameCount > 0) {
    piiLabelsArray.push('Father Name');
    piiDataArray.push(fatherNameCount);
    piiBgColorsArray.push(pieColors1[26]);
  }
  //
  if (motherNameCount > 0) {
    piiLabelsArray.push('Mother Name');
    piiDataArray.push(motherNameCount);
    piiBgColorsArray.push(pieColors1[27]);
  }
  //
  if (brotherNameCount > 0) {
    piiLabelsArray.push('Brother Name');
    piiDataArray.push(brotherNameCount);
    piiBgColorsArray.push(pieColors1[28]);
  }
  //
  if (sisterNameCount > 0) {
    piiLabelsArray.push('Sister Name');
    piiDataArray.push(sisterNameCount);
    piiBgColorsArray.push(pieColors1[29]);
  }
  //
  if (daughterNameCount > 0) {
    piiLabelsArray.push('Daughter Name');
    piiDataArray.push(daughterNameCount);
    piiBgColorsArray.push(pieColors1[30]);
  }
  //
  if (sonNameCount > 0) {
    piiLabelsArray.push('Son Name');
    piiDataArray.push(sonNameCount);
    piiBgColorsArray.push(pieColors1[31]);
  }
  //
  if (orderIDCount > 0) {
    piiLabelsArray.push('Order ID');
    piiDataArray.push(orderIDCount);
    piiBgColorsArray.push(pieColors1[32]);
  }
  //
  if (transactionIDCount > 0) {
    piiLabelsArray.push('Transaction ID');
    piiDataArray.push(transactionIDCount);
    piiBgColorsArray.push(pieColors1[33]);
  }
  //
  if (cookieDataCount > 0) {
    piiLabelsArray.push('Cookie Data');
    piiDataArray.push(cookieDataCount);
    piiBgColorsArray.push(pieColors1[34]);
  }



  var data2 = {
    labels: piiLabelsArray,
    datasets: [
      {
        label: 'Sensitive Data',
        data: piiDataArray,
        backgroundColor: piiBgColorsArray,
        borderWidth: 1,
      },
    ],
  };


  const piichartOptions = {
    labels: piiLabelsArray,
    colors: piiBgColorsArray,
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

                    {(activeScan.theCollection && activeScan.theCollection.collectionName) ? activeScan.theCollection.collectionName : '<Name not found>'}

                  </td>
                </tr>


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Endpoints</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {activeScan.endpointsCount}

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

                    <span style={{ fontWeight: 'bold', }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(activeScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(activeScan.scanCompletedAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>

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




        {onLoading == true ?

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

          {currentVulnerability &&

            <div className="modalWindow" style={{ backgroundColor: '#E1E1E1' }}>


              <h5 style={{ color: '#000' }}><strong>Vulnerability Name</strong>: {currentVulnerability.vulnerabilityName}</h5>
              <h5 style={{ color: '#000' }}><strong>Severity</strong>: {currentVulnerability.riskScore}</h5>

              <hr />

              <h5 style={{ color: '#000' }}>Remediations</h5>
              <hr />

              {currentVulnerability && currentVulnerability.remediations.map((item) => (
                <div style={{ backgroundColor: '#ebedef', padding: 10, marginTop: 10, borderRadius: 15 }}>

                  <h5 style={{ color: '#000' }}>{item.remediationHeading}</h5>
                  <h5 style={{ color: '#000', fontSize: 16, fontWeight: 'normal' }}>{item.remediationContent}</h5>

                </div>
              ))}

            </div>
          }


        </Modal>      



        <Modal
          isOpen={threatModellingModalIsOpen}
          onRequestClose={closeThreatModellingModal}
          style={customStyles2}
          contentLabel="Threat Modelling"
        >

          <button style={{ float: 'right', backgroundColor: 'transparent', borderWidth: 0 }} onClick={closeThreatModellingModal} >
            <AiFillCloseCircle size={30} color={'#000'} />
          </button>

          {currentVulnerability &&

            <div className="modalWindow" style={{ backgroundColor: '#c2eef4', height:'100%' }}>

            <h4>Threat Modelling for <strong>{currentVulnerability.owasp[0]}</strong></h4>


        {currentVulnerability.owasp.includes('API1:2023 Broken Object Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/brokenObjectLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.owasp.includes('API2:2023 Broken Authentication') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API3:2023 Broken Object Property Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/brokenObjectPropertyLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API4:2023 Unrestricted Resource Consumption') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/unrestrictedResourceConsumption.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API5:2023 Broken Function Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/brokenFunctionLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp[0] == 'API6:2023 Unrestricted Access to Sensitive Business Flows' &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/unrestrictedAccessToSensitiveBusinessFlows.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API7:2023 Server Side Request Forgery') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/serverSideRequestForgery.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API8:2023 Security Misconfiguration') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/securityMisconfiguration.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API9:2023 Improper Inventory Management') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/improperInventoryManagement.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.owasp.includes('API10:2023 Unsafe Consumption of APIs') &&
            <object type="text/html" data={global.baseUrl + "/threat-modelling-html/unsafeConsumptionOfAPIs.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }                

            </div>
          }


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

          {currentVulnerability &&

            <div className="modalWindow" style={{ backgroundColor: '#c2eef4', height:'100%' }}>

            <h4>Cost of Breach for <strong>{currentVulnerability.owasp[0]}</strong></h4>


        {currentVulnerability.owasp.includes('API1:2023 Broken Object Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenObjectLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.owasp.includes('API2:2023 Broken Authentication') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API3:2023 Broken Object Property Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenObjectPropertyLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API4:2023 Unrestricted Resource Consumption') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unrestrictedResourceConsumption.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API5:2023 Broken Function Level Authorization') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenFunctionLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp[0] == 'API6:2023 Unrestricted Access to Sensitive Business Flows' &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unrestrictedAccessToSensitiveBusinessFlows.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API7:2023 Server Side Request Forgery') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/serverSideRequestForgery.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API8:2023 Security Misconfiguration') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/securityMisconfiguration.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   


        {currentVulnerability.owasp.includes('API9:2023 Improper Inventory Management') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/improperInventoryManagement.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }   

        {currentVulnerability.owasp.includes('API10:2023 Unsafe Consumption of APIs') &&
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unsafeConsumptionOfAPIs.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        }                

            </div>
          }


        </Modal>        

      </>

    </div>
  )
}

export default ThreatModellingScanDetail
