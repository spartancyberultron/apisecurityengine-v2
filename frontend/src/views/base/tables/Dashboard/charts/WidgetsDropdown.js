import React from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'

const WidgetsDropdown = () => {
  return (
    <CRow>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          className="mb-4"
          style={{backgroundColor:'#FADBD8 ', alignItems:'center'}}
          value={
            <> 26K{' '}</>
          }
          title="Users"
          
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              />
            }
          />
        </CCol>
        {/*  */}
        <CCol sm={6} lg={3}>
        <CWidgetStatsA
          style={{backgroundColor:'#D4E6F1', alignItems:'center'}}
          className="mb-4"
          value={
            <> 26K{' '}</>
          }
          title="Users"
          
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
        <CWidgetStatsA
          style={{backgroundColor:'#E5E8E8', alignItems:'center'}}
          className="mb-4"
          value={
            <> 26K{' '}</>
          }
          title="Users"
          
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
        <CWidgetStatsA
          style={{backgroundColor:'#FCF3CF ', alignItems:'center'}}
          className="mb-4"
          value={
            <> 26K{' '}</>
          }
          title="Users"
          
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
        <CWidgetStatsA
          style={{backgroundColor:'#D6EAF8', alignItems:'center'}}
          className="mb-4"
          value={
            <> 26K{' '}</>
          }
          title="Users"
          
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
        <CWidgetStatsA
          style={{backgroundColor:'#E8DAEF', alignItems:'center'}}
          className="mb-4"
          value={
            <> 26K{' '}</>
          }
          title="Users"
          
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              />
            }
          />
        </CCol>
      </CRow>
    )
  }
              
              

export default WidgetsDropdown
