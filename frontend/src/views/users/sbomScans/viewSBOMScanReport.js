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

const ViewSBOMScanReport = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [sbomScan, setSBOMScan] = useState(null)
  const [onLoading, setOnLoading] = useState(true); 

  const [exportingPDF, setExportingPDF] = useState(false);

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  ) 

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
    const response = await axios.post('api/v1/sbomScans/getSBOMScanDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSBOMScan(response.data.sbomScan);

    setOnLoading(false);

  };  
  

  const goBack = async () => {

    navigate('/sbom-scans')
  }

  const columns = [
    {
      label: "#",
      options: {
        filter: false,
      }
    },
    {
      label: "Package",
      options: {
        filter: true,
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
        customBodyRender: (value, tableMeta, updateValue) => {         

          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

<div style={{
  padding: 5,
  width: 400,
  textAlign: 'center',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 'normal',
  overflowWrap: 'break-word',  // Ensures long words or URLs break and wrap within the container
  wordWrap: 'break-word',      // Legacy support for older browsers
  whiteSpace: 'normal',        // Allows text to wrap onto multiple lines
  textOverflow: 'ellipsis',    // Adds ellipsis (...) if text overflows (optional)
}}>
  {value}
</div>

            </div>
          )
        }
      }
    },
    {
      label: "CWE",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => {  

          let items = []

          if(value && value.length> 0){
            items = value.split(',')
          }         
          

          return (
            <div style={{ display: "flex", alignItems: "center", flexDirection:'column' }}>
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: 5,
                    margin:5,
                    width: 120,
                    backgroundColor: '#b6b0ff',
                    color: '#000',
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {item.trim()}
                </div>
              ))}
            </div>
          );
        }
      }
    },
    {
      label: "CVE",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => {  

          let items = []

          if(value && value.length> 0){
            items = value.split(',')
          }         
          

          return (
            <div style={{ display: "flex", alignItems: "center", flexDirection:'column' }}>
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: 5,
                    margin:5,
                    width: 120,
                    backgroundColor: '#80f1ff',
                    color: '#000',
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                   
                  }}
                >
                  {item.trim()}
                </div>
              ))}
            </div>
          );
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

          } else if (value == 'MODERATE') {

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

  var criticalCount = 0;
  var highCount = 0;
  var mediumCount = 0;
  var lowCount = 0;

  if (sbomScan && sbomScan.vulnerabilities) {

    for (var i = 0; i < sbomScan.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);
      dataItem.push(sbomScan.vulnerabilities[i].package);      

      dataItem.push(sbomScan.vulnerabilities[i].title);
      dataItem.push(sbomScan.vulnerabilities[i].description);

      dataItem.push(sbomScan.vulnerabilities[i].cwe);
      dataItem.push(sbomScan.vulnerabilities[i].cve);

      dataItem.push(sbomScan.vulnerabilities[i].severity);   

      if(sbomScan.vulnerabilities[i].severity == 'CRITICAL'){
        criticalCount++;
      }else if(sbomScan.vulnerabilities[i].severity == 'HIGH'){
        highCount++;
      }else if(sbomScan.vulnerabilities[i].severity == 'MODERATE'){
        mediumCount++;
      }else if(sbomScan.vulnerabilities[i].severity == 'LOW'){
        lowCount++;
      }

      tableData.push(dataItem);
    }
  }






  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', }}>

      <>

      <CButton
    onClick={goBack}
    className="darkButton"                
    color="primary"
  >
    <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight:10 }} />
    Back to Scans List
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
              <h2>{sbomScan.scanName}</h2>
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

                    {sbomScan.scanName}

                  </td>
                </tr>
               


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Vulnerabilities</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {sbomScan.vulnerabilities ? (sbomScan.vulnerabilities).length : '---'}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Started At</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {(new Date(sbomScan.createdAt)).toLocaleDateString('en-US')} - {(new Date(sbomScan.createdAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>




                <tr>

<td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

  <span style={{ fontWeight: 'bold', }}>Scan Status</span>
</td>
<td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

{sbomScan.status == 'completed' &&
                     <span style={{backgroundColor:'#28C76F', color:'#fff', padding:10, }}>{sbomScan.status.toUpperCase()}</span>
        }

       

      {sbomScan.status == 'in progress' &&
                     <span style={{backgroundColor:'#FFC300', color:'#black', padding:10}}>{sbomScan.status.toUpperCase()}</span>
        }

</td>
</tr>


               


{sbomScan.status == 'completed' &&


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(sbomScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(sbomScan.scanCompletedAt)).toLocaleTimeString('en-US')}

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
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{criticalCount}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{highCount}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{mediumCount}</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>{lowCount}</th>

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




        <div style={{
          maxWidth: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'column',
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
    </div>
  )
}

export default ViewSBOMScanReport