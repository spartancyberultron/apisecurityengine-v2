
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


const TopRisks = () => {


    const [loading, setLoading] = useState(false)
    const [topRisks, setTopRisks] = useState([])



    useEffect(() => {

        getResponse();
    
      }, []);
    
      
    
    
      const getResponse = () => {
    
        // Set from localStorage cache
        const storedTopRisks = localStorage.getItem('topRisks');
        if (storedTopRisks && storedTopRisks !== "undefined") {
            try {
                setTopRisks(JSON.parse(storedTopRisks));
            } catch (e) {
                console.error("Failed to parse top risks from localStorage:", e);
                setTopRisks([]); // or any appropriate default value
            }
        } else {
            setTopRisks([]); // or any appropriate default value
        }
    
    
        const endpoint = 'api/v1/users/getTopRisks';
        const token = localStorage.getItem('ASIToken');
    
        axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(response => {    
    
            setTopRisks(response.data);
    
            // Save into local storage to show from cache while it loads next time
            localStorage.setItem('topRisks', JSON.stringify(response.data));
    
            setLoading(false)
          })
          .catch(error => {
            //console.error('Error fetching dashboard data:', error);
            setLoading(false)
          });
      };
  

      console.log('topRisks:',topRisks)

    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    Top Risks</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                List of top risks with potential impact and likelihood</span>
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


                            <table style={{width:'100%'}}>

<thead>
    <th style={{padding:10, width:'70%'}}>Risk</th>
    <th style={{padding:10}}>Impact</th>
    <th style={{padding:10}}>Occurences</th>
</thead>

<tbody>
{topRisks && topRisks.map((risk, index) => (

    <>

    {risk.riskScore &&
                    <tr key={index}>
                        <td>{risk.title}</td>
                        <td>
                            <span style={{padding: 5, backgroundColor: '#ea5455', fontSize: 12, color: '#fff', borderRadius: 5 }}>
                                {risk.riskScore}
                            </span>
                        </td>
                        <td>{risk.count}</td>
                    </tr>
}

                    </>
                ))}

   

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

export default TopRisks