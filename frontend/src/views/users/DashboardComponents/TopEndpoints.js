
import React, { useState, useEffect, useRef } from "react";

import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';
import Chart from 'react-apexcharts'
import { CgNotes } from "react-icons/cg";
import { extractHostAndEndpoint } from '../utils';
import { Link } from "react-router-dom";


import {
    CCol,
    CRow,  
    CContainer,  
  } from '@coreui/react'


const TopEndpoints = () => {

    const [topEndpoints, setTopEndpoints] = useState([])
    const [loadingTopEndpoints, setLoadingTopEndpoints] = useState(false)

  useEffect(() => {

    fetchTopEndpoints();   

  }, []);     


  const fetchTopEndpoints = () => {

    
   
    setLoadingTopEndpoints(true);

    const endpoint = 'api/v1/users/getTopEndPoints';
    const token = localStorage.getItem('ASIToken');

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {


        setTopEndpoints(response.data.topEndpoints);
        

        setLoadingTopEndpoints(false)
      })
      .catch(error => {
        //console.error('Error fetching dashboard data:', error);
        setLoadingTopEndpoints(false)
      });
  };





    return (


        <div className="theCards"  style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%', 
          }}>

            <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize:18, display:'block' }}>Top Endpoints</span>
            <span style={{fontSize:13, textAlign:'left', alignSelf:'left', color:'rgb(165, 163, 174',display:'block' }}>Endpoints with most vulnerabilities</span>
            <hr style={{borderColor:'white'}}/>


            {loadingTopEndpoints ?


                  <div style={{display:'flex', flexDirection:'column', height:300, justifyContent:'space-between'}}>
                        <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',  }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',marginTop:5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',  }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',marginTop:5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                </div>
              :

              <>

                {topEndpoints && topEndpoints.length > 0 ?
                  <div style={{ padding: 10, borderRadius: 10 }}>
                    <table className="topEndpointsTable" cellPadding={10} style={{ width: '100%' }}>

                      <thead>
                        <th>ENDPOINT</th>
                        <th>RISK</th>
                        <th>ISSUES</th>
                        <th>PII DATA</th>
                      </thead>

                      <tbody>

                        {topEndpoints && topEndpoints.map((endpoint) => (

                          <tr>
                            <td>
                              <span style={{ width:400, display:'inline-block',wordWrap: 'break-word',fontSize: 13,  }}>{endpoint.name}</span><br />
                            </td>
                            <td>                       


                            {endpoint.riskScore == 'CRITICAL' &&

                                <span style={{ color: '#ffffff', background:'rgb(255, 0, 0)', padding: 5, borderRadius: 5, fontSize: 9 }}>
                                  {endpoint.riskScore}
                                </span>
                            }
                            
                              {endpoint.riskScore == 'HIGH' &&

                                <span style={{ color: '#ffffff', background:'rgb(166, 0, 27)', padding: 5, borderRadius: 5, fontSize: 9 }}>
                                  {endpoint.riskScore}
                                </span>
                              }

                              {endpoint.riskScore == 'MEDIUM' &&

                                <span style={{ color: '#000000', background:'rgb(246, 190, 0)', padding: 5, borderRadius: 5, fontSize: 9 }}>
                                  {endpoint.riskScore}
                                </span>
                              }


                              {endpoint.riskScore == 'LOW' &&

                                <span style={{ color: '#000', background:'#B3FFB3', padding: 5, borderRadius: 5, fontSize: 9 }}>
                                  {endpoint.riskScore}
                                </span>
                              }
                              


                            </td>

                            <td>
                              {endpoint.vulnCount}
                            </td>

                            <td>

                              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                                {endpoint.piiFields?endpoint.piiFields.length:''}
                              </div>

                            </td>
                          </tr>

                        ))}

                      </tbody>

                    </table>

                    <Link to="/endpoints" style={{ marginLeft: 10, marginTop: 40, marginRight: 45, textDecoration: 'none', display:'none', float: 'right' }}>View All Endpoints</Link>

                  </div>

                  :

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30, }}>
                      <CgNotes size={40} style={{ color: '#f73164', textAlign: 'center' }} />
                      <text style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize:13 }}>No Data Yet</text>
                  </div>

                }

              </>

            }

          </div>

    )

}

export default TopEndpoints