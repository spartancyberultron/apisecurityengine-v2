
import React, { useState, useEffect, useRef } from "react";

import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';
import Chart from 'react-apexcharts'
import { CgNotes } from "react-icons/cg";


import {
    CCol,
    CRow,
    CContainer,
} from '@coreui/react'


const ComplianceStatus = () => {


    
    const [loading, setLoading] = useState(false)

    const [threatAlerts, setThreatAlerts] = useState(null)

    useEffect(() => {
      getResponse();
    }, []);

    function getAggregatedCount(standardName) {

        if(threatAlerts.categories){
        // Find the index of the standard in the categories array
        const index = threatAlerts.categories.indexOf(standardName);
        
        // Check if the standard exists in the categories array
        if (index === -1) {
          throw new Error('Standard name not found in categories');
        }
      
        // Ensure index is within bounds of all arrays
        if (index >= threatAlerts.rest.length || index >= threatAlerts.soapGraphQL.length || index >= threatAlerts.llm.length) {
          throw new Error('Index out of bounds in data arrays');
        }
      
        // Sum the values from rest, soapGraphQL, and llm at the same index
        const aggregatedCount = (
          (threatAlerts.rest[index] || 0) +
          (threatAlerts.soapGraphQL[index] || 0) +
          (threatAlerts.llm[index] || 0)
        );
        
      
        return aggregatedCount;
        }
      }

    const getResponse = () => {

        setLoading(true);
        
      // Set from localStorage cache
    /*  if (localStorage.getItem('threatAlerts')) {
        setThreatAlerts(JSON.parse(localStorage.getItem('threatAlerts')));
      } else {
        setThreatAlerts(true);
      }*/

      const endpoint = 'api/v1/users/getThreatAlerts';
      const token = localStorage.getItem('ASIToken');

      axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {

          setThreatAlerts(response.data.response);

          // Save into local storage to show from cache while it loads next time
          localStorage.setItem('threatAlerts', JSON.stringify(response.data));

          setLoading(false)
        })
        .catch(error => {
          setLoading(false)
        });
    };


    console.log('threatAlerts:', threatAlerts)


    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>Compliance Status</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Current status against relevant standards and regulations (e.g., GDPR, HIPAA)</span>
                <hr style={{ borderColor: 'white' }} />


                {loading ?



                    <div style={{ display: 'flex', flexDirection: 'column', height: 300, justifyContent: 'space-between' }}>
                        <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                    </div>

                    :

                    <>


                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>

                            <div style={{ flex: 1, minWidth: 0, marginTop: 10 }}>


{threatAlerts && threatAlerts.categories && threatAlerts.categories.length>0 ?
                                <table style={{width:'100%'}}>

                                    <thead>
                                        <th style={{padding:10}}>Compliance Standard</th>
                                        <th style={{padding:10}}>Status</th>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td>ISO 27001</td>
                                            <td>
                                            {getAggregatedCount('ISO 27001') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>NIST CISF</td>
                                            <td>
                                            {getAggregatedCount('NIST CISF') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>GDPR</td>
                                            <td>
                                            {getAggregatedCount('GDPR') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>PCI DSS</td>
                                            <td>
                                            {getAggregatedCount('PCI DSS') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>HIPAA</td>
                                            <td>
                                            {getAggregatedCount('HIPAA') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>MITRE ATT&CK</td>
                                            <td>
                                            {getAggregatedCount('MITRE ATT&CK') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>NIST 800-53</td>
                                            <td>
                                            {getAggregatedCount('NIST 800-53') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>ASVS</td>
                                            <td>
                                            {getAggregatedCount('ASVS') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>


                                        <tr>
                                            <td>CMMC</td>
                                            <td>
                                            {getAggregatedCount('CMMC') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>CCPA</td>
                                            <td>
                                            {getAggregatedCount('CCPA') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>FIPS</td>
                                            <td>
                                            {getAggregatedCount('FIPS') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>FISMA</td>
                                            <td>
                                            {getAggregatedCount('FISMA') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>

                                        <tr>
                                            <td>RBI CSF</td>
                                            <td>
                                            {getAggregatedCount('RBI CSF') == 0 ?
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                                :
                                                <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>

                                                }                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
:

<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30, }}>
                <CgNotes size={40} style={{ color: '#f73164', textAlign: 'center' }} />
                <text style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize: 13 }}>No Data Yet</text>
              </div>
}

                            </div>

                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default ComplianceStatus