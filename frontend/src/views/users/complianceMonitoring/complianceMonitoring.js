import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { ShimmerTable } from "react-shimmer-effects";
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdStart } from "react-icons/md";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";

import { FaEye } from "react-icons/fa";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import APICompliances from './apiCompliances'
import LLMCompliances from './llmCompliances'

const ComplianceMonitoring = () => {

    return (
        <div className="activeScans">

            <div style={{ width: '100%' }}>
                
                <div>
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <span className="pageHeader">Compliance Monitoring</span>
                    </div>

                    <Tabs className="addAgentPage">

                        <TabList style={{ borderWidth: 0, display: 'flex', justifyContent: 'flex-start' }}>
                            <Tab style={{ width: 200, borderWidth: 0 }}>
                                API Compliance
                            </Tab>

                            <Tab style={{ width: 200, borderWidth: 0 }}>
                                LLM Compliance
                            </Tab>


                        </TabList>

                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>

                            <APICompliances />
                        </TabPanel>


                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>


                            <LLMCompliances />

                        </TabPanel>

                    </Tabs>

                </div>
            </div>
        </div>
    )
}

export default ComplianceMonitoring