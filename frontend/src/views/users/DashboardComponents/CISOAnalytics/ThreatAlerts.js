
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


const ThreatAlerts = () => {


    const [loading, setLoading] = useState(false)

    const data = {
        categories: ['GDPR', 'HIPAA', 'PCI DSS', 'ISO 27001', 'SOC 2', 'FERPA', 'CCPA', 'FISMA', 'NIST', 'HITECH'],
        rest: [12, 8, 10, 6, 9, 11, 7, 5, 8, 10], // Example data for REST threats
        soap: [9, 6, 7, 5, 8, 10, 6, 4, 7, 9], // Example data for SOAP threats
        graphql: [7, 5, 6, 4, 7, 8, 5, 3, 6, 7], // Example data for GraphQL threats
        sbom: [5, 3, 4, 2, 6, 7, 3, 2, 5, 6], // Example data for SBOM threats
      };
    
      const chartOptions = {
        chart: {
          type: 'bar',
          height: 350,
          stacked: false,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: data.categories,
          labels: {
            show: true,
            
          },
        },
        yaxis: {
          title: {
            text: 'Number of Threats',
          },
          labels: {
            show: true,
            
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + ' threats';
            },
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetX: 40,
        },
      };
    
      const chartSeries = [
        {
          name: 'REST',
          data: data.rest,
        },
        {
          name: 'SOAP',
          data: data.soap,
        },
        {
          name: 'GraphQL',
          data: data.graphql,
        },
        {
          name: 'SBOM',
          data: data.sbom,
        },
      ];

    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>Threat Alerts</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Summary of current threat alerts and advisories</span>
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
                                height: '60vh',
                            }}>

                            <div style={{ flex: 1, minWidth: 0, marginTop: 100 }}>
                            <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={450}
      />

                            </div>

                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default ThreatAlerts