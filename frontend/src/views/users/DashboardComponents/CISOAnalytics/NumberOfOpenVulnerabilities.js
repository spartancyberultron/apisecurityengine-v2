
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


const NumberOfOpenVulnerabilities = () => {


    const [loading, setLoading] = useState(false)


    const labelsArray = [
        'Broken Object Level Authorization',
        'Sensitive Data in Path Params',
        'Basic Authentication Detected',
        'Endpoint Not Secured by SSL',
        'Unauthenticated Endpoint Returning Sensitive Data',
        'Sensitive Data in Query Params',
        'PII Data Detected in Response',
        'HTTP Verb Tampering Possible',
        'Content Type Injection Possible',
        'Security Headers not Enabled on Host',
        'Resource Deletion Possible',
        'Broken Authentication',
        'Excessive Data Exposure',
        'Injection',
        'XSS Vulnerability Found',
        'Wallet Hijacking Possible',
        'Pre Image Attack Possible',
        'Lack of Resource & Rate Limiting'
      ];
    
      const countsArray = [
        5, 0, 7, 2, 3, 4, 6, 1, 0, 8, 0, 3, 0, 5, 7, 0, 2, 4
      ];
    
     
    
      const chartOptions = {
        chart: {
          type: 'bar'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            distributed:true,
            barHeight: 15,
          }
        },
        xaxis: {
          categories: labelsArray,
          title: {
            text: 'Vulnerability Types',
            style: {
              color: '#000',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          },
          labels: {
            show: false,
            style: {
              colors: '#000' 
            }
          }
        },
        legend: {
            labels: {
              colors: '#5D596C' 
            },
            containerMargin: {
              top: 100 
            }
        },
        tooltip: {
            theme: 'light', 
            style: {
              color: '#000000' 
            }
        }

      };
    
      const chartSeries = [
        {
          name: 'Number of Vulnerabilities',
          data: countsArray
        }
      ];


    return (



        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%', height:700
        }}>



            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    Number of Open Vulnerabilities</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Track the current count of unresolved vulnerabilities</span>
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
                                height: '50vh',
                            }}>

                            <div style={{ flex: 1, minWidth: 0, marginTop: 100 }}>
 <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={500}
        width={'100%'}
      />

                            </div>

                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default NumberOfOpenVulnerabilities