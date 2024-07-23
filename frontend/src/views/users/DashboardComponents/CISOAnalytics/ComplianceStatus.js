
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


                                <table style={{width:'100%'}}>

                                    <thead>
                                        <th style={{padding:10}}>Compliance Standard</th>
                                        <th style={{padding:10}}>Status</th>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td>ISO 27001</td>
                                            <td>
                                                <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>NIST CISF</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>GDPR</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>PCI DSS</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>HIPAA</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>MITRE ATT&CK</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>NIST 800-53</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>ASVS</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>
                                            </td>
                                        </tr>


                                        <tr>
                                            <td>CMMC</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#ea5455', fontSize:12, color:'#fff', borderRadius:5 }}>Non-Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>CCPA</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>FIPS</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>FISMA</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>RBI CSF</td>
                                            <td>
                                            <span style={{padding:5, backgroundColor:'#28C76F', fontSize:12, color:'#fff', borderRadius:5 }}>Compliant</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>


                            </div>

                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default ComplianceStatus