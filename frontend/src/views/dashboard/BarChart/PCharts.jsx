import React from 'react'
import { CCard, CCardBody, CCol, CCardHeader, CRow } from '@coreui/react'
import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'
import { DocsCallout } from 'src/components'

const Charts = () => {
  const random = () => Math.round(Math.random() * 100)

  return (
    <CRow>
      <CCol xs={10}>
        <CCard style={{marginLeft:'25%'}}>
          <CCardBody>
            <CChartPie
              data={{
                datasets: [
                  {
                    data: [80, 200, 120, 120],
                    backgroundColor: [ '#36A2EB', '#FFCE56', '#1E8449', '#2874A6', ],
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

      
     
  )
}

export default Charts
