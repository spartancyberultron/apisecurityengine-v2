import React, { useState, useEffect, useRef } from "react";
import { CButton, CToast, CToastBody } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom'
import {  useNavigate } from 'react-router-dom'

import axios from 'axios';



import { IoMdArrowRoundBack } from "react-icons/io";
import { ShimmerTable, ShimmerTitle, ShimmerCircularImage } from "react-shimmer-effects";


const ViewSOAPGraphQLScanReport = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [soapOrGraphQLScan, setSoapOrGraphQLScan] = useState(null)
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
    const response = await axios.post('api/v1/soapOrGraphQLScans/getSOAPOrGraphQLScanDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSoapOrGraphQLScan(response.data.soapOrGraphQLScan);

    setOnLoading(false);

  };  
  

  const goBack = async () => {

    navigate('/soap-graphql-scans')
  }

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

  if (soapOrGraphQLScan && soapOrGraphQLScan.vulnerabilities) {

    for (var i = 0; i < soapOrGraphQLScan.vulnerabilities.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);

      console.log('soapOrGraphQLScan.vulnerabilities[i]:',soapOrGraphQLScan.vulnerabilities[i])

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].testCaseName);
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].description);

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].exploitability);

      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].owasp);
      dataItem.push(soapOrGraphQLScan.vulnerabilities[i].cwe);


      tableData.push(dataItem);
    }
  }



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

                    <span style={{ fontWeight: 'bold', }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(soapOrGraphQLScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(soapOrGraphQLScan.scanCompletedAt)).toLocaleTimeString('en-US')}

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
    </div>
  )
}

export default ViewSOAPGraphQLScanReport