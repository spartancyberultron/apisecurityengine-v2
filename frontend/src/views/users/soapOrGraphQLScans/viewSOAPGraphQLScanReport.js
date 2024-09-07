import React, { useState, useEffect, useRef } from "react";
import { CButton, CToast, CToastBody } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom'
import {  useNavigate } from 'react-router-dom'

import axios from 'axios';

import { CiEdit } from "react-icons/ci";

import remediationData from './remediations.json'; 

import { IoMdArrowRoundBack } from "react-icons/io";
import { ShimmerTable, ShimmerTitle, ShimmerCircularImage } from "react-shimmer-effects";
import Modal from 'react-modal';
import { AiFillCloseCircle } from "react-icons/ai";

const ViewSOAPGraphQLScanReport = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [soapOrGraphQLScan, setSoapOrGraphQLScan] = useState(null)
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

  useEffect(() => {

    window.scrollTo(0, 0);

    setOnLoading(true);

    var arr = location.search.split('=');

    var theScanId = arr[1];

    setScanId(theScanId);

    loadScanDetails(theScanId);

  }, []);

  const closeModal = async () => {

    setModalIsOpen(false);
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


  const handleDropdownChange = (event) => {

    console.log('event.target.value:',event.target.value)
    setRiskAcceptance(event.target.value);
  };

  const closeAcceptanceModal = async () => {

    setAcceptanceModalIsOpen(false);

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

  useEffect(() => {

  }, [onLoading]);

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


  const loadScanDetails = async (theScanId) => {

    const data = {
      scanId: theScanId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.post('api/v1/soapOrGraphQLScans/getSOAPOrGraphQLScanDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSoapOrGraphQLScan(response.data.soapOrGraphQLScan);

    setOnLoading(false);

  };  

  const openRemediationModal = async (value) => {

    setCurrentVulnerability(value);

    setModalIsOpen(true);
  };
  

  const goBack = async () => {

    navigate('/soap-graphql-scans')
  }

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
        setAcceptanceModalIsOpen(true);
  
      }else{
  
        setSubmittingReason(true);    
  
        const data = {
          vulnId: currentVulnForRiskAcceptance._id,
          riskAcceptance:riskAcceptance,
          riskAcceptanceReason:reason
        };
  
  
        const token = localStorage.getItem('ASIToken');
        const response = await axios.post('api/v1/users/updateRiskAcceptanceForASOAPGraphQLVulnerability', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log('response.data.data:',response.data.data)
  
        if(response.data.data){
  
          setSoapOrGraphQLScan((prevState) => ({
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

      

  
          //setRiskAcceptance('No');
         // setReason("");
          //setSubmittingReason(false)   
      };
  

  const columns = [
    {
      label: "#",
      options: {
        filter: false,
      }
    },   
    {
      label: "Title",
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
      label: "Exploitability",
      options: {
        filter: false,
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
              alignItems: "left"
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
              flexDirection:'column',
              alignItems: "left"
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
                  backgroundColor: '#80faff',
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
        filter: false,
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
    {
      label: "Risk Acceptance",
      options: {
        filter: true,
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
    selectableRows: false, // <===== will turn off checkboxes in rows
    rowsPerPage: 20,
    rowsPerPageOptions: [],
    textLabels: {
      body: {
        noMatch: 'No vulnerabilities found',
      }
    },
    setRowProps: (row, dataIndex, rowIndex) => {

      console.log('row', row)
      return {
        style: {
          backgroundColor: row[10] === 'Yes' ? "#FFCCCC" : "#ffffff" // Alternate row colors
        }
      };
    }
  };


  var tableData = [];

  if (soapOrGraphQLScan && soapOrGraphQLScan.vulnerabilities) {

    for (var i = 0; i < soapOrGraphQLScan.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);

      console.log('soapOrGraphQLScan.vulnerabilities[i]:',soapOrGraphQLScan.vulnerabilities[i])

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].testCaseName);
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].description);
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].severity);


      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].exploitability);

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].owasp);
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].cwe);

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i]); // for cost of breach
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i]); // for remediations

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i]); // For risk acceptance
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].riskAcceptance?soapOrGraphQLScan.vulnerabilities[i].riskAcceptance:'No'); // For risk acceptance


      tableData.push(dataItem);
    }
  }




const getRemediation = (testCaseName) => {

  console.log('remediationData:',remediationData)

  // Find the matching test case
  const result = remediationData.find(item => item.testCaseName === testCaseName);



  if (result) {
      return result.remediation;
  } else {
      return 'Test case not found.';
  }
};

  


  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>

      <>

      <CButton
    onClick={goBack}
    className="darkButton"                
    color="primary"
  >
    <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight:10 }} />
    Back to SOAP/GraphQL Scans
  </CButton>

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
              <h2>{soapOrGraphQLScan.scanName}</h2>
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

                    {soapOrGraphQLScan.scanName}

                  </td>
                </tr>
               


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Vulnerabilities</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {soapOrGraphQLScan.vulnerabilities ? (soapOrGraphQLScan.vulnerabilities).length : '---'}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Started At</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {(new Date(soapOrGraphQLScan.createdAt)).toLocaleDateString('en-US')} - {(new Date(soapOrGraphQLScan.createdAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>


                <tr>

<td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

  <span style={{ fontWeight: 'bold', }}>Scan Status</span>
</td>
<td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

{soapOrGraphQLScan.status == 'completed' &&
                     <span style={{backgroundColor:'#28C76F', color:'#fff', padding:10, }}>{soapOrGraphQLScan.status.toUpperCase()}</span>
        }

       

      {soapOrGraphQLScan.status == 'in progress' &&
                     <span style={{backgroundColor:'#FFC300', color:'#black', padding:10}}>{soapOrGraphQLScan.status.toUpperCase()}</span>
        }

</td>
</tr>


               


{soapOrGraphQLScan.status == 'completed' &&
                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(soapOrGraphQLScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(soapOrGraphQLScan.scanCompletedAt)).toLocaleTimeString('en-US')}

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

            <h4>Cost of Breach for <strong>{currentVulnerability.owasp[0]}</strong></h4>



            {JSON.stringify(currentVulnerability.owasp).includes('API1') || JSON.stringify(currentVulnerability.owasp).includes('A1') && (
   <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenObjectLevelAuthorization.html"} width="100%" height="100%"
   style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
 </object>     
)}

{(JSON.stringify(currentVulnerability.owasp).includes('API2') || JSON.stringify(currentVulnerability.owasp).includes('A2')) && ( 
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenAuthentication.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }   

{(JSON.stringify(currentVulnerability.owasp).includes('API3') || JSON.stringify(currentVulnerability.owasp).includes('A3')) && (       
       <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenObjectPropertyLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('API4') || JSON.stringify(currentVulnerability.owasp).includes('A4')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unrestrictedResourceConsumption.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }   

{(JSON.stringify(currentVulnerability.owasp).includes('API5') || JSON.stringify(currentVulnerability.owasp).includes('A5')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html/brokenFunctionLevelAuthorization.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
       ) }   

{(JSON.stringify(currentVulnerability.owasp).includes('API6') || JSON.stringify(currentVulnerability.owasp).includes('A6')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unrestrictedAccessToSensitiveBusinessFlows.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('API7') || JSON.stringify(currentVulnerability.owasp).includes('A7')) && (       
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/serverSideRequestForgery.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('API8') || JSON.stringify(currentVulnerability.owasp).includes('A8')) && (       
            <object type="text/html" data={global.baseUrl + "/breach-cost-html/securityMisconfiguration.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('API9') || JSON.stringify(currentVulnerability.owasp).includes('A9')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html/improperInventoryManagement.html"} width="100%" height="100%"
              style={{ alignSelf: 'center', borderWidth: 0, marginLeft:'0vw' }}>
            </object>     
        )}   

{(JSON.stringify(currentVulnerability.owasp).includes('API10') || JSON.stringify(currentVulnerability.owasp).includes('A10')) && (       

            <object type="text/html" data={global.baseUrl + "/breach-cost-html/unsafeConsumptionOfAPIs.html"} width="100%" height="100%"
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
          <h5 style={{ color: '#000' }}>{currentVulnForRiskAcceptance.testCaseName}</h5>
          <hr/>
          <span style={{ color: '#000' }}><strong>Endpoints</strong> : {currentVulnForRiskAcceptance.endpoints.join(',')}</span>
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


              <h5 style={{ color: '#000' }}><strong>Vulnerability Name</strong>: {currentVulnerability.vulnerabilityName}</h5>

              <hr />

              <h5 style={{ color: '#000' }}>Remediations</h5>
              <hr />
             

                  <h5 style={{ color: '#000', fontSize: 16, fontWeight: 'normal' }} 
                  dangerouslySetInnerHTML={{__html:currentVulnerability.remediation}}>
                  </h5>               

            </div>
          }


        </Modal>

    </div>
  )
}

export default ViewSOAPGraphQLScanReport