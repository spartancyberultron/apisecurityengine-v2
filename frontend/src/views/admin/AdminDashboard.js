import React, { useState, useEffect, useRef } from "react";

import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'

import axios from 'axios';

import {
  CCol,
  CRow,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CContainer,
  CCard,
  CCardBody,
} from '@coreui/react'
import { Link } from "react-router-dom";

const AdminDashboard = () => {

  const random = () => Math.round(Math.random() * 100)
  const [dashboardData, setDashboardData] = useState({})
  const [vulnerabilityDistribution, setVulnerabilityDistribution] = useState({})
  const [topEndpoints, setTopEndpoints] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [last5DaysVulnTrends, setLast5DaysVulnTrends] = useState([])  

  const ref = useRef(null);  

  useEffect(() => {

   
      

  }, []);


  return (
    <>

      <CContainer>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width:'100%' }}>        


        </div>

      </CContainer>
    </>
  )
}

export default AdminDashboard