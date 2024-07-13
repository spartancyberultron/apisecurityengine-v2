
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


const Top10Vulnerabilities = () => {


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
      ];
      
      const chartOptions = {
        chart: {
          type: 'bar',
          height: 600, 
          toolbar: {
            show: false 
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '80%', 
            endingShape: 'rounded' ,
            distributed:true
          }
        },
        dataLabels: {
          enabled: false 
        },
        xaxis: {
          categories: labelsArray,
          labels: {
            show:true,
            style: {
              colors: '#000' 
            }
          }
        },
        yaxis: {
          labels: {
            show:true,
            style: {
              colors: '#000' 
            }
          }
        },
        colors: ['#FF0000', '#FF5733', '#FF8C00', '#FFD700', '#9ACD32',  '#32CD32', '#4B0082', '#008080', '#6A5ACD', '#FF7F50'], 
        title: {
          text: 'Top 10 Vulnerabilities',
          align: 'center',
          style: {
            color: '#333', 
            fontSize: '16px'
          }
        },
        tooltip: {
          theme: 'light'
        },
        series: [
          {
            name: 'Impact Level', 
            data: [10, 8, 7, 5, 4, 3, 3, 2, 1, 1] 
          }
        ]
      };
      
    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    Top 10 Vulnerabilities</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Highlight the most critical vulnerabilities impacting the system</span>
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

                            <div style={{ flex: 1, minWidth: 0, marginTop: 10 }}>


                            <Chart
        options={chartOptions}
        series={chartOptions.series}
        type="bar"
        height={400}
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

export default Top10Vulnerabilities