
import React, { useState, useEffect, useRef } from "react";

import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';
import Chart from 'react-apexcharts'
import { CgNotes } from "react-icons/cg";

import GaugeChart from 'react-gauge-chart'

import {
    CCol,
    CRow,
    CContainer,
} from '@coreui/react'


const RiskScore = () => {


    const [loading, setLoading] = useState(false)
    const [riskScore, setRiskScore] = useState(false)


    useEffect(() => {

        getResponse();
    
      }, []);
    
      
    
    
      const getResponse = () => {

        setLoading(true);
    
        // Set from localStorage cache
        if (localStorage.getItem('riskScore')) {
            setRiskScore(JSON.parse(localStorage.getItem('riskScore')));
        } else {
            setRiskScore(true);
        }
    
    
        const endpoint = 'api/v1/users/getRiskScore';
        const token = localStorage.getItem('ASIToken');
    
        axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(response => {
    
    
            setRiskScore(response.data);
    
            // Save into local storage to show from cache while it loads next time
            localStorage.setItem('riskScore', JSON.stringify(response.data));
    
            setLoading(false)
          })
          .catch(error => {
            //console.error('Error fetching dashboard data:', error);
            setLoading(false)
          });
      };
  

    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>Risk Score</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                     Overall risk score based on current vulnerabilities, threats, and incidents. {riskScore.description}</span>
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
                                flexDirection:'column',
                                alignItems: 'center',
                            }}>

                            <div style={{ flex: 1, minWidth: 0, marginTop: 10, width:'100%' }}>


                            <GaugeChart id="gauge-chart3"
                        nrOfLevels={3}
                        colors={['#28c76f','#fd7e14', '#ea5455', ]}
                        arcWidth={0.2}
                        percent={riskScore.riskScore/100}
                        hideText={true}  
                        width='100%'
                        />       


                            </div>

                                <span style={{fontSize:30}}>{riskScore.riskScore}%</span>
                        </div>

                    </>
                }

            </div>

        </div>


    )

}

export default RiskScore