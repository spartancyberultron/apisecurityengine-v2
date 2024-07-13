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

const LineCharts = () => {
  const random = () => Math.round(Math.random() * 100)

  return (
    <div>
      <div>
        <CCard>
          
          <CCardBody>
            <CChartLine
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(220, 220, 220, 0.2)',
                    borderColor: 'rgba(220, 220, 220, 1)',
                    data: [random(), random(), random(), random(), random(), ],
                  },
                  {
                    label: 'My Second dataset',
                    backgroundColor: 'rgba(151, 187, 205, 0.2)',
                    borderColor: 'rgba(151, 187, 205, 1)',
                    data: [random(), random(), random(), random(), random(), random(), random()],
                  },
                  
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

export default LineCharts
