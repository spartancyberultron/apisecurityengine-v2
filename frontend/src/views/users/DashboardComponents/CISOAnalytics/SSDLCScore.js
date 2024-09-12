import React, { useState, useEffect } from "react";
import Chart from 'react-apexcharts';
import { Breathing } from 'react-shimmer'
import axios from 'axios';
import { CgNotes } from "react-icons/cg";

const SSDLCScore = () => {
    const [loading, setLoading] = useState(false);
    const [ssdlcScore, setSsdlcScore] = useState(null);

    useEffect(() => {
        getResponse();
    }, []);

    const getResponse = () => {
        setLoading(true);
        
        // Set from localStorage cache
        if (localStorage.getItem('ssdlcScore')) {
            setSsdlcScore(JSON.parse(localStorage.getItem('ssdlcScore')));
        } else {
            setSsdlcScore(true);
        }

        const endpoint = 'api/v1/users/getSSDLCScore';
        const token = localStorage.getItem('ASIToken');

        axios.get(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setSsdlcScore(response.data.ssdlcScore);
                // Save into local storage to show from cache while it loads next time
                localStorage.setItem('ssdlcScore', JSON.stringify(response.data.ssdlcScore));
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
            });
    };

    const customLogTransform = (value) => {
        return value === 0 ? 0 : Math.log10(value + 1);
    };

    let data;
    let chartOptions;
    let chartSeries;

    if (ssdlcScore) {
        // Adapt the data for the chart
        data = {
            categories: ['Development', 'Design', 'Testing', 'Maintenance'],
            series: [
                {
                    name: 'REST',
                    data: [
                        ssdlcScore.ActiveScanVulnerability ? ssdlcScore.ActiveScanVulnerability.Development : 0,
                        ssdlcScore.ActiveScanVulnerability ? ssdlcScore.ActiveScanVulnerability.Design : 0,
                        ssdlcScore.ActiveScanVulnerability ? ssdlcScore.ActiveScanVulnerability.Testing : 0,
                        ssdlcScore.ActiveScanVulnerability ? ssdlcScore.ActiveScanVulnerability.Maintenance : 0
                    ],
                },
                {
                    name: 'SOAP/GraphQL',
                    data: [
                        ssdlcScore.SOAPOrGraphQLScanVulnerability ? ssdlcScore.SOAPOrGraphQLScanVulnerability.Development : 0,
                        ssdlcScore.SOAPOrGraphQLScanVulnerability ? ssdlcScore.SOAPOrGraphQLScanVulnerability.Design : 0,
                        ssdlcScore.SOAPOrGraphQLScanVulnerability ? ssdlcScore.SOAPOrGraphQLScanVulnerability.Testing : 0,
                        ssdlcScore.SOAPOrGraphQLScanVulnerability ? ssdlcScore.SOAPOrGraphQLScanVulnerability.Maintenance : 0
                    ],
                },
                {
                    name: 'SBOM',
                    data: [
                        ssdlcScore.SBOMScanVulnerability ? ssdlcScore.SBOMScanVulnerability.Development : 0,
                        ssdlcScore.SBOMScanVulnerability ? ssdlcScore.SBOMScanVulnerability.Design : 0,
                        ssdlcScore.SBOMScanVulnerability ? ssdlcScore.SBOMScanVulnerability.Testing : 0,
                        ssdlcScore.SBOMScanVulnerability ? ssdlcScore.SBOMScanVulnerability.Maintenance : 0
                    ],
                },
                {
                    name: 'LLM',
                    data: [
                        ssdlcScore.LLMScan ? ssdlcScore.LLMScan.Development : 0,
                        ssdlcScore.LLMScan ? ssdlcScore.LLMScan.Design : 0,
                        ssdlcScore.LLMScan ? ssdlcScore.LLMScan.Testing : 0,
                        ssdlcScore.LLMScan ? ssdlcScore.LLMScan.Maintenance : 0
                    ],
                },
            ],
        };

        // Store original data for tooltip
        const originalData = data.series.map(series => ({ ...series }));

        // Apply custom log transform to the data
        data.series = data.series.map(series => ({
            ...series,
            data: series.data.map(customLogTransform)
        }));

        // Chart options
        chartOptions = {
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '80%',
                    endingShape: 'rounded',
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    // Display original value, not the transformed one
                    const originalVal = originalData[opts.seriesIndex].data[opts.dataPointIndex];
                    return originalVal === 0 ? '' : originalVal;
                },
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['#fff'],
            },
            xaxis: {
                categories: data.categories,
                title: {
                    text: 'Number of Vulnerabilities (custom log scale)',
                    style: {
                        color: '#000',
                    },
                },
                labels: {
                    formatter: function (value) {
                        return Math.pow(10, value).toFixed(0);
                    },
                    style: {
                        colors: '#000',
                    },
                },
            },
            yaxis: {
                title: {
                    text: '',
                    style: {
                        color: '#000',
                    },
                },
                labels: {
                    style: {
                        colors: '#000',
                    },
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: function (val, opts) {
                        // Display original value in tooltip
                        return originalData[opts.seriesIndex].data[opts.dataPointIndex];
                    },
                },
            },
        };

        chartSeries = data.series;
    }

    return (
        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>
            <div style={{width:'100%'}}>
                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    SSDLC Score
                </span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                    SSDLC Score according to the number of vulnerabilities found in different phases and APIs
                </span>
                <hr style={{ borderColor: 'white' }} />

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: 300, justifyContent: 'space-between' }}>
                        <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', }} />
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width:'100%',
                            height:'100%',
                        }}
                    >
                        {ssdlcScore &&
                            <>
                                {ssdlcScore.ActiveScanVulnerability && 
                                !Object.values(ssdlcScore).every(scan => 
                                    Object.values(scan).every(value => value === 0)
                                ) ?
                                    <Chart
                                        options={chartOptions}
                                        series={chartSeries}
                                        type="bar"
                                        width={500}
                                        height={350}
                                    />
                                :
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0, }}>
                                        <CgNotes size={40} style={{ color: '#f73164', textAlign: 'center' }} />
                                        <text style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize:13 }}>No Data Yet</text>
                                    </div>
                                }
                            </>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default SSDLCScore;