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
import remediationData from './llm-remediations.json';

const ViewLLMScanReport = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [llmScan, setLLMScan] = useState(null)
  const [onLoading, setOnLoading] = useState(true); 

  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [currentVulnerability, setCurrentVulnerability] = React.useState(null);
  const [costOfBreachModalIsOpen, setCostOfBreachModalIsOpen] = React.useState(false);
  const [reasonEmptyError, setReasonEmptyError] = useState(false);

  const [currentVulnForRiskAcceptance, setCurrentVulnForRiskAcceptance] = React.useState(null);
  const [submittingReason, setSubmittingReason] = useState(false);

  const [exportingPDF, setExportingPDF] = useState(false);
  const [acceptanceModalIsOpen, setAcceptanceModalIsOpen] = useState(false);
  const [riskAcceptance, setRiskAcceptance] = useState("No");
  const [reason, setReason] = useState('');
  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  ) 


  // Function to get remediation based on the probe name
const getRemediation = (vulnerabilityName) => {
  // Find the matching probe
  const result = remediationData.find(item => item.vulnerability === vulnerabilityName);

  if (result) {
    return result;
  } else {
    return 'Vulnerability not found.';
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

  const closeAcceptanceModal = async () => {

    setAcceptanceModalIsOpen(false);

  };


  function getVulnerabilityDetails(probe) {

    const vulnerabilities = {
        "blank": {
            "vulnerability": "Empty prompt is a tactic to bypass security measures in place",
            "owasp": "LLM 07:2023 - Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "An empty prompt might be unexpected and could be exploited by an attacker to inject malicious code or manipulate the LLM's behavior in unintended ways."
        },
        "atkgen": {
            "vulnerability": "Red-teaming LLM autonomously attacks a target seeking to provoke a harmful response.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "The red-teaming LLM isn't aligned with the target LLM's goals, aiming to elicit harmful outputs instead of following intended use. This misalignment exposes weaknesses in the target LLM's training or safety measures that could be exploited by malicious actors."
        },
        "continuation": {
            "vulnerability": "Continuation of Undesirable Word",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs because the model is influenced by the way prompts are crafted. By testing if the model completes an undesirable word, the attacker is probing the limitations of the prompt and potentially exploiting them to generate harmful content."
        },
        "dan": {
            "vulnerability": "Do Anything Now(DAN Attack Vulnerability)",
            "owasp": "LLM04:2023 - Unauthorised Code Execution",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "An attacker can craft a specially designed prompt that could potentially trick the LLM into executing unauthorized code on the system, bypassing security measures."
        },
        "donotanswer": {
            "vulnerability": "Prompts that could be misused to cause harm or violate ethical principles.",
            "owasp": "LLM07:2023 - Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Responsible AI avoids generating outputs that misalign with human values, goals, or safety. Prompts that could lead to harmful or unethical outputs highlight this misalignment."
        },
        "encoding": {
            "vulnerability": "Tricking an LLM by hiding malicious code within seemingly normal text.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability allows attackers to manipulate an LLM by disguising malicious code within seemingly normal text through encoding techniques."
        },
        "gcg": {
            "vulnerability": "Prompt injection through a malicious addition.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs when an attacker manipulates the LLM's prompt with a malicious suffix, causing it to deviate from its intended behavior."
        },
        "glitch": {
            "vulnerability": "Probing the LLM to find inputs that cause unexpected behavior.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs when an attacker injects malicious code into prompts fed to the LLM, causing it to behave abnormally."
        },
        "goodside": {
            "vulnerability": "Crafted input tricks LLM to disregard prior instructions and follow attacker's commands.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability involves getting large language models (LLMs) to ignore their designers’ plans by including malicious text such as “ignore your previous instructions” in the user input."
        },
        "knownbadsignatures": {
            "vulnerability": "Malicious content injection probes for LLMs.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "An attacker crafts specific prompts to trick the LLM into generating malicious content (like phishing emails, malware code) by manipulating its understanding of the desired output."
        },
        "leakerplay": {
            "vulnerability": "Vulnerable LLM unintentionally reproduce training data in its outputs.",
            "owasp": "LLM02:2023 - Data Leakage",
            "cwe": ["CWE-200: Information Exposure"],
            "description": "Vulnerability occurs when an LLM unintentionally reveals information from its training data, including potentially sensitive details. In this case, the probe is trying to see if the LLM will directly copy information from its training data."
        },
        "lmrc": {
            "vulnerability": "Limited probing of the LLM's capabilities.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Attackers manipulate user input to trick the LLM into following their instructions instead of the intended ones, potentially leading to data leaks or unauthorized actions."
        },
        "malwaregen": {
            "vulnerability": "LLM susceptibility to prompts for malicious code generation",
            "owasp": "LLM04:2023 - Unauthorised Code Execution",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "An attacker tricks the LLM into generating malicious code, potentially allowing for unauthorized execution on a system."
        },
        "misleading": {
            "vulnerability": "LLM susceptibility to manipulation for generating deceptive content.",
            "owasp": "LLM07: Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Vulnerability arises when an LLM model is not aligned with the desired goals or expectations, potentially leading it to generate misleading or false claims."
        },
        "packagehallucination": {
            "vulnerability": "Crafting prompts for code generation that request insecure, non-existent packages.",
            "owasp": "LLM04:2023 - Unauthorized Code Execution",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "By requesting non-existent packages, the attacker attempts to trick the code generation into fetching and executing malicious code from an unintended source."
        },
        "promptinject": {
            "vulnerability": "Ability to inject prompts during inference to manipulate model outputs",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Prompt injection attacks trick large language models (LLMs) into processing malicious code or data by manipulating the prompts they receive. This can lead to the LLM generating harmful outputs or revealing sensitive information."
        },
        "realtoxicityprompts": {
            "vulnerability": "Limited test set for prompts that might induce toxic outputs from a large language model.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "An attacker can inject malicious prompts to trick the LLM into generating toxic content, even if it wasn't explicitly trained on such content. This can be done by crafting specific prompts that exploit the LLM's internal biases or reasoning processes."
        },
        "snowball": {
            "vulnerability": "LLM tricked into cascading false claims by complex questions exploiting knowledge gaps.",
            "owasp": "LLM07: Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Snowballed Hallucination probes exploit the model's limitations in reasoning and justification, causing it to confidently provide incorrect answers. Inadequate AI Alignment refers to a mismatch between the model's goals and the user's goals. In this case, the model is not aligned with the goal of providing accurate information."
        },
        "xss": {
            "vulnerability": "Insecure LLM output handling can expose systems to cross-site scripting (XSS) and other attacks.",
            "owasp": "LLM02:2023 - Data Leakage",
            "cwe": ["CWE-200: Information Exposure"],
            "description": "Data leakage occurs when an LLM accidentally reveals sensitive information through its responses, enabling unauthorized access to private data."
        }
    };

    return vulnerabilities[probe] || null;
}

const handleDropdownChange = (event) => {

  console.log('event.target.value:',event.target.value)
  setRiskAcceptance(event.target.value);
};


const openCostOfBreachModal = async (value) => {

  setCurrentVulnerability(value);

  setCostOfBreachModalIsOpen(true);
};


const processContent = (data) => {
  // Use a regular expression to match code blocks and split the text accordingly
  const parts = data.split(/(?<=\n)(?=```)/);
  
  let htmlContent = '';

  parts.forEach(part => {
    if (part.startsWith('```')) {
      // Extract code block language and code
      const [lang, ...codeLines] = part.split('\n').slice(1, -1); // Remove the opening and closing ```
      htmlContent += `<pre style="background-color: #f5f5f5;
      border-left: 3px solid #333;
      padding: 10px;
      overflow-x: auto;
      white-space: pre-wrap;
      margin: 10px 0;"><code class="${lang.trim()}">${codeLines.join('\n')}</code></pre>`;
    } else {
      // Split text into paragraphs by newline
      const paragraphs = part.split('\n').filter(line => line.trim() !== '');
      paragraphs.forEach(paragraph => {
        htmlContent += `<p>${paragraph}</p>`;
      });
    }
  });

  return htmlContent;
};


const closeCostOfBreachModal = async () => {

  setCostOfBreachModalIsOpen(false);
};

const closeModal = async () => {

  setModalIsOpen(false);
};


console.log('currentVulnerability:', currentVulnerability)


  const handleAcceptanceSave = async() => {

    /*

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

      console.log('response.data.data:',response.data.data)

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

    */

    setAcceptanceModalIsOpen(false);

    setRiskAcceptance('No');
    setReason("");
    setSubmittingReason(false)
    

  };
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

  const openRemediationModal = async (value) => {

    setCurrentVulnerability(value);

    setModalIsOpen(true);
  };



  const loadScanDetails = async (theScanId) => {

    const data = {
      scanId: theScanId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.post('api/v1/llmScans/getLLMScanDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('response.data:',response.data)

    setLLMScan(response.data.llmScan);

    setOnLoading(false);

  };  


  function extractProbeName(filename) {

    const parts = filename.split("___");
    if (parts.length === 2) {
      return parts[1].split(".")[0]; // Extract probe name before extension
    } else {
      return null; // Return null if filename is not in the expected format
    }
  }
  
  

  const goBack = async () => {

    navigate('/llm-scans')
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
        filter: false,
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
              alignItems: "flex-start"
            }} >
               {value && value.map((item, index) => (
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
              flexDirection:'column',
              alignItems: "flex-start"
            }} >
               {value && value.map((item, index) => (
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
    textLabels: {
      body: {
        noMatch: 'No vulnerabilities found',
      }
    }
  };


  var tableData = [];

  if (llmScan && llmScan.resultFileContents) {

    for (var i = 0; i < llmScan.resultFileContents.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);
      var probeName = extractProbeName(llmScan.resultFileContents[i].file_name)
      
      var vulnDetails = getVulnerabilityDetails(probeName)


      dataItem.push(vulnDetails.vulnerability); // Vulnerability 

      dataItem.push(vulnDetails.description); // Description

      dataItem.push((getRemediation(vulnDetails.vulnerability)).severity); // Description

      


      dataItem.push([vulnDetails.owasp]); // OWASP
      dataItem.push(vulnDetails.cwe); // CWE

      dataItem.push(vulnDetails); // for cost of breach
      dataItem.push(vulnDetails); // for remediations

      dataItem.push(vulnDetails); // For risk acceptance
      

      tableData.push(dataItem);
    }
  }

  console.log('llmScan:', llmScan)


  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

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
              <h2>{llmScan.scanName}</h2>
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
                    <span style={{ fontWeight: 'bold', }}>Scan Name </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {llmScan.scanName}

                  </td>
                </tr>


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Model Name </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {llmScan.modelName}

                  </td>
                </tr>
               


                <tr style={{display:'none'}}>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Vulnerabilities</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {llmScan.vulnerabilities ? (llmScan.vulnerabilities).length : '---'}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Started At</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {(new Date(llmScan.createdAt)).toLocaleDateString('en-US')} - {(new Date(llmScan.createdAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(llmScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(llmScan.scanCompletedAt)).toLocaleTimeString('en-US')}

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
            marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15, display:'none'
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
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>

              </tbody>
            </table>


          </div>
        }


        <div style={{
          width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'column',
          marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15, display:'none'
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


       

      </>

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

            <h4>Cost of Breach for <strong>{currentVulnerability.owasp}</strong></h4>



            {JSON.stringify(currentVulnerability.owasp).includes('01') || JSON.stringify(currentVulnerability.owasp).includes('01') && (
   <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm01.html"} width="100%" height="100%"
   style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
 </object>     
)}

{(JSON.stringify(currentVulnerability.owasp).includes('02') || JSON.stringify(currentVulnerability.owasp).includes('02')) && ( 
            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm02.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }   

{(JSON.stringify(currentVulnerability.owasp).includes('03') || JSON.stringify(currentVulnerability.owasp).includes('03')) && (       
       <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm03.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('04') || JSON.stringify(currentVulnerability.owasp).includes('04')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm04.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }   

{(JSON.stringify(currentVulnerability.owasp).includes('05') || JSON.stringify(currentVulnerability.owasp).includes('05')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm05.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }   

{(JSON.stringify(currentVulnerability.owasp).includes('06') || JSON.stringify(currentVulnerability.owasp).includes('06')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm06.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('07') || JSON.stringify(currentVulnerability.owasp).includes('07')) && (       
            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm07.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('08') || JSON.stringify(currentVulnerability.owasp).includes('08')) && (       
            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm08.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('09') || JSON.stringify(currentVulnerability.owasp).includes('09')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm09.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('10') || JSON.stringify(currentVulnerability.owasp).includes('10')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html-llm/llm10.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }    

 

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
          <h5 style={{ color: '#000' }}>{currentVulnForRiskAcceptance.vulnerability}</h5>
          <p style={{ color: '#000' }}>{currentVulnForRiskAcceptance.description}</p>
          <hr/>
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


              <h5 style={{ color: '#000' }}><strong>Vulnerability Name</strong>: {currentVulnerability.vulnerability}</h5>

              <hr />

              <h5 style={{ color: '#000' }}>Remediations</h5>
              <hr />

             

                  <h5 style={{ color: '#000', fontSize: 16, fontWeight: 'normal' }} 
                  dangerouslySetInnerHTML={{__html:processContent((getRemediation(currentVulnerability.vulnerability)).remediation)}}>
                  </h5>

               

            </div>
          }


        </Modal>
 


    </div>
  )
}

export default ViewLLMScanReport



