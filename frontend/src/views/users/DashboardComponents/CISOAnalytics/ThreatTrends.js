
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


const ThreatTrends = () => {


    const [loading, setLoading] = useState(false)
    const [threatTrends, setThreatTrends] = useState({})

    useEffect(() => {

      getResponse();
  
    }, []);
  
    
  
  
    const getResponse = () => {
  
      // Set from localStorage cache
      if (localStorage.getItem('threatTrends')) {
          setThreatTrends(JSON.parse(localStorage.getItem('threatTrends')));
      } else {
          setThreatTrends(true);
      }
  
  
      const endpoint = 'api/v1/users/getThreatTrends';
      const token = localStorage.getItem('ASIToken');
  
      axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
  
  
          setThreatTrends(response.data);
  
          // Save into local storage to show from cache while it loads next time
          localStorage.setItem('threatTrends', JSON.stringify(response.data));
  
          setLoading(false)
        })
        .catch(error => {
          //console.error('Error fetching dashboard data:', error);
          setLoading(false)
        });
    };

    const data = {
        categories: ['2024-07-02', '2024-07-03', '2024-07-04', '2024-07-05', '2024-07-06', '2024-07-07', '2024-07-08', '2024-07-09', '2024-07-10', '2024-07-11'],
        rest: [10, 12, 9, 14, 8, 6, 15, 10, 8, 7], // Example data for REST threats
        soap: [8, 6, 5, 7, 9, 10, 5, 8, 6, 5], // Example data for SOAP threats
        graphql: [5, 7, 6, 4, 5, 6, 4, 3, 6, 5], // Example data for GraphQL threats
        sbom: [3, 4, 2, 3, 5, 6, 2, 3, 4, 3], // Example data for SBOM threats
      };
    
      const chartOptions = {
        chart: {
          type: 'line',
          height: 350,
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        xaxis: {
          categories: threatTrends.categories,
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
          data: threatTrends.rest,
        },
        {
          name: 'SOAP',
          data: threatTrends.soap,
        },
        {
          name: 'GraphQL',
          data: threatTrends.graphql,
        },
        {
          name: 'SBOM',
          data: threatTrends.sbom,
        },
      ];

    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>Threat Trends</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Analysis of trending threats affecting the environment</span>
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
        type="line"
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

export default ThreatTrends