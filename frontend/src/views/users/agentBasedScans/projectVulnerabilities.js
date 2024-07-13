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
  const [currentVulnerability, setCurrentVulnerability] = React.useState(null);

  const [exportingPDF, setExportingPDF] = useState(false);

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  )

  const customStyles = {
    content: {
      top: '20%',
      left: '10%',
      width: '80%',
      right: 'auto',
      bottom: 'auto',
      height: '70%',
      backgroundColor: '#E1E1E1',
      borderRadius: 15,
      borderColor: 'yellow'
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
    "#",
    "VULNERABILITY",
    "ENDPOINT",
    "DESCRIPTION",
    {
      label: "SEVERITY",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {

          let bgColor;
          let theColor;

          if (value == 'CRITICAL') {

            bgColor = '#FFA5A5';
            theColor = '#FF0000';

          } else if (value == 'HIGH') {

            bgColor = '#E98590';
            theColor = '#A6001B';

          } else if (value == 'MEDIUM') {

            bgColor = '#FFE99D';
            theColor = 'black';

          } else if (value == 'LOW') {

            bgColor = '#B3FFB3';
            theColor = 'green';
          }


          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              <span className="blackText" style={{ padding: 5, backgroundColor: bgColor, color: 'black', width: 120,
                 textAlign: 'center', borderRadius: 10, fontSize: 13 }}>{value}
              </span>

            </div>
          )
        }
      }
    },
    {
      label: "REMEDIATIONS",
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
                className="primaryButton" style={{ fontSize: 13, color:'white', }}>Remediations
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
  };


  var tableData = [];

  if (result) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);
      dataItem.push(result.vulnerabilities[i].vulnerability.vulnerabilityName);

      var endpointObject = result.vulnerabilities[i].endpoint;

      if (endpointObject) {
        dataItem.push(endpointObject);
      } else {
        dataItem.push('---');
      }

      /*if (endpointObject.authorization.type == 'None') {

        dataItem.push('Unauthenticated');

      } else {

        dataItem.push('Authenticated');

      }*/

      dataItem.push(result.vulnerabilities[i].description);
      dataItem.push(result.vulnerabilities[i].vulnerability.riskScore);
      dataItem.push(result.vulnerabilities[i].vulnerability);

      tableData.push(dataItem);
    }
  }


  var numOfHighVulns = 0
  var numOfMediumVulns = 0;

  if (result) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      if (result.vulnerabilities[i].vulnerability.riskScore == 'HIGH') {
        numOfHighVulns++;
      }

      if (result.vulnerabilities[i].vulnerability.riskScore == 'MEDIUM') {
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
      position: 'right',
      verticalAlign: 'middle',
    },
    chart: {
      width: '100%',
      height: '100%',
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


  if (result) {

    for (var i = 0; i < result.vulnerabilities.length; i++) {

      if (result.vulnerabilities[i].vulnerability.vulnerabilityCode == 6) {

        var piiFields = result.piiFields;

        //console.log('endpoint', endpoint.piiFields)      

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
      position: 'right',
      verticalAlign: 'middle',
    },
    chart: {
      width: '100%',
      height: '100%',
    },
  };

  const piiChartSeries = piiDataArray;   
 

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>

      <>

        {onLoading ?

          <div style={{
            width: '80%', marginLeft: '10%', marginRight: '10%', marginTop: '2%'
          }}>

            <ShimmerTitle line={6} gap={10} variant="primary" />
          </div>

          :

          <div style={{
            width: '80%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background:'#fff', padding: 20, borderRadius: 15
          }}>

            <div style={{ marginBottom: '2rem', }}>
              <h2>{result.projectName}</h2>
              <hr/>

              <table>                  

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
                  Back to Projects</span>
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
            width: '80%', marginLeft: '10%', marginRight: '10%',
            marginTop: '2%',
          }}>

            <ShimmerTable row={5} col={7} />


          </div>


          :
          <div style={{
            width: '80%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
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
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfHighVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{numOfMediumVulns}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>

              </tbody>
            </table>


          </div>
        }


        <div style={{
          width: '80%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'column',
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
          {(vulnDistroChartSeries.length > 0 || piiChartSeries.length > 0) &&


            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 100 }}>


              {vulnDistroChartSeries.length > 0 &&

                <div style={{width:'100%'}}>

                  <h4 style={{ color: '#000', textAlign: 'center' }}>Vulnerability Distribution</h4>  
                  <hr/>                

                  <Chart options={vulnDistrochartOptions} series={vulnDistroChartSeries} type="pie" width="50%"/>

                </div>
              }

              {piiChartSeries.length > 0 &&

                <div>

                  <h5 style={{ color: '#000', textAlign: 'center' }}>Sensitive Data</h5>
                  <hr/> 
                  <Chart options={piichartOptions} series={piiChartSeries} type="pie" width="50%" />

                </div>
              }

            </div>

          }

        </div>


        <div style={{
          width: '80%', marginLeft: '10%', marginRight: '10%', display: 'flex', flexDirection: 'column',
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

              <h5 style={{ color: '#000' }}>REMEDIATIONS</h5>
              <hr />

              {currentVulnerability && currentVulnerability.remediations.map((item) => (
                <div style={{ backgroundColor: '#ebedef', padding: 10, marginTop: 10, borderRadius: 15 }}>

                  <h5 style={{color:'#000'}}>{item.remediationHeading}</h5>
                  <h5 style={{color:'#000', fontSize:16, fontWeight:'normal'}}>{item.remediationContent}</h5>

                </div>
              ))}

            </div>
          }

        </Modal>

      </>

    </div>
  )
}

export default ProjectVulnerabilities