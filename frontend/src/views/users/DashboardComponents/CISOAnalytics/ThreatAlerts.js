import React, { useState, useEffect } from "react";
import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';
import Chart from 'react-apexcharts'
import { CgNotes } from "react-icons/cg";
import { CCol, CRow, CContainer } from '@coreui/react'

const ThreatAlerts = () => {
    const [loading, setLoading] = useState(true)
    const [threatAlerts, setThreatAlerts] = useState(null)

    useEffect(() => {
      getResponse();
    }, []);

    const getResponse = () => {

        setLoading(true);
        
      // Set from localStorage cache
   /*   if (localStorage.getItem('threatAlerts')) {
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

            console.log('response.data:',response.data.response)

          setThreatAlerts(response.data.response);

          // Save into local storage to show from cache while it loads next time
          localStorage.setItem('threatAlerts', JSON.stringify(response.data.response));

          setLoading(false)
        })
        .catch(error => {
          setLoading(false)
        });
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
            categories: threatAlerts ? threatAlerts.categories : [],
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
            data: threatAlerts ? threatAlerts.rest : [],
        },
        {
            name: 'SOAP/GraphQL',
            data: threatAlerts ? threatAlerts.soapGraphQL : [],
        },        
        {
            name: 'LLM',
            data: threatAlerts ? threatAlerts.llm : [],
        },
    ];

    return (
        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>
            <div>
                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>Threat Alerts</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                    Summary of current threat alerts and advisories
                </span>
                <hr style={{ borderColor: 'white' }} />

                {loading ? (
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
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '60vh',
                        }}>
                        <div style={{ flex: 1, minWidth: 0, marginTop: 100 }}>

                     {threatAlerts.categories && threatAlerts.categories.length >0 ?     
                            <Chart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height={450}
                            />
                            :

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30, }}>
                    <CgNotes size={40} style={{ color: '#f73164', textAlign: 'center' }} />
                    <text style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize:13 }}>No Data Yet</text>
                  </div>
}

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ThreatAlerts