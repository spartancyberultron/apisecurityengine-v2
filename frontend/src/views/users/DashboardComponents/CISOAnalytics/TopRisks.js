import React, { useState, useEffect } from "react";
import axios from 'axios';
import { CContainer, CCard, CCardBody, CSpinner } from '@coreui/react';
import { CgNotes } from "react-icons/cg";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const TopRisks = () => {
    const [loading, setLoading] = useState(true);
    const [topRisks, setTopRisks] = useState({});
    const [activeTab, setActiveTab] = useState(0);


    function getBgColor(value) {
        if (value === 'CRITICAL') {
            return '#FF0000';
        } else if (value === 'HIGH') {
            return '#A6001B';
        } else if (value === 'MEDIUM' || value === 'MODERATE') {
            return '#FFC300';
        } else if (value === 'LOW') {
            return '#B3FFB3';
        } else {
            return '#ea5455'; // Default color if impact is not one of the defined categories
        }
    }
    
    function getTextColor(value) {
        if (value === 'CRITICAL' || value === 'HIGH') {
            return '#fff';
        } else if (value === 'MEDIUM' || value === 'MODERATE') {
            return 'black';
        } else if (value === 'LOW') {
            return '#fff';
        } else {
            return '#fff'; // Default text color if impact is not one of the defined categories
        }
    }

    

    useEffect(() => {
        getResponse();
    }, []);

    const getResponse = () => {
        const endpoint = 'api/v1/users/getTopRisks';
        const token = localStorage.getItem('ASIToken');

        axios.get(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setTopRisks(response.data.length>0 ?(response.data)[0]:null);
            localStorage.setItem('topRisks', JSON.stringify(response.data));
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching top risks data:', error);
            setLoading(false);
        });
    };

    console.log('topRisks:', topRisks)

    const renderTable = (data) => (

        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th style={{ padding: 10, borderBottom: '1px solid #ddd', width: '70%' }}>Risk</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #ddd' }}>Impact</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #ddd' }}>Occurrences</th>
                </tr>
            </thead>
            <tbody>
                {data && data.length > 0 ? (
                    data.map((risk, index) => (
                        <tr key={index}>
                            <td style={{ padding: 10 }}>{risk.vulnerabilityName}</td>
                            <td style={{ padding: 10 }}>
    <span
        style={{
            padding: 5,
            backgroundColor: getBgColor(risk.impact || 'N/A'),
            fontSize: 12,
            color: getTextColor(risk.impact || 'N/A'),
            borderRadius: 5
        }}
    >
        {risk.impact === 'MODERATE' ? 'MEDIUM' : risk.impact || 'N/A'}
    </span>
</td>
                            <td style={{ padding: 10 }}>{risk.count || 'N/A'}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: 20 }}>
                            <CgNotes size={40} style={{ color: '#f73164' }} />
                            <p style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize: 13 }}>No Data Yet</p>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    return (
        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '100%', 
        }}>


        <CContainer>
            <CCard>
                <CCardBody>
                    <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                        Top Risks
                    </span>
                    <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174)', display: 'block' }}>
                        List of top risks with potential impact and likelihood
                    </span>
                    <hr style={{ borderColor: 'white' }} />

                    {loading ? (
                        <CSpinner color="primary" />
                    ) : (

                        <>
                        {topRisks &&
                        <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                            <TabList>
                                <Tab>REST API Collections Scans</Tab>
                                <Tab>Attack Surface Scans</Tab>
                                <Tab>API Traffic Scans</Tab>
                                <Tab>SOAP/GraphQL Scans</Tab>
                                <Tab>SBOM Scans</Tab>
                                <Tab>LLM Scans</Tab>
                            </TabList>

                            <TabPanel>
                                {renderTable(topRisks.topRESTVulnerabilities)}
                            </TabPanel>
                            <TabPanel>
                                {renderTable(topRisks.topAttackSurfaceScanVulnerabilities)}
                            </TabPanel>
                            <TabPanel>
                                {renderTable(topRisks.topProjectVulnerabilities)}
                            </TabPanel>
                            <TabPanel>
                                {renderTable(topRisks.topSOAPOrGraphQLScanVulnerabilities)}
                            </TabPanel>
                            <TabPanel>
                                {renderTable(topRisks.topSBOMScanVulnerabilities)}
                            </TabPanel>
                            <TabPanel>
                                {renderTable(topRisks.topLLMVulnerabilities)}
                            </TabPanel>
                        </Tabs>
}
                        </>
                    )}
                </CCardBody>
            </CCard>
        </CContainer>
        </div>
    );
}

export default TopRisks;
