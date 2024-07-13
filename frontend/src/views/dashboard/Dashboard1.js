import React from 'react'
import { CCard, CCol, CContainer, CRow,} from '@coreui/react'
import Chart from './BarChart/Chart'
import PCharts from './BarChart/PCharts'

const Dashboard1 = () => {
    
   
  return (
    <>
    <CContainer>
      <CRow>
        <CCol sm="auto" style={{ 
          width:'20%',
          height:130, 
          marginRight:60, 
          backgroundColor:'#FDEBD0',
          borderWidth:3,
          borderStyle: 'dashed',
          borderColor:'#D35400',
          textAlign:'center'
          }}>
            <h3 style={{marginTop:10}}>342</h3>
            <p style={{marginTop:30}}>Total Jobs</p>
          </CCol>
        <CCol sm="auto" style={{
           width:'20%', 
           height:130, 
           marginRight:60, 
           backgroundColor:'#D0ECE7',
           borderWidth:3,
           borderStyle: 'dashed',
           borderColor:'red',
           textAlign:'center',
           }}>
            <h3 style={{marginTop:10}}>342</h3>
            <p style={{marginTop:30}}>Opens Jobs</p>
           </CCol>

        <CCol sm="auto" style={{ 
          width:'20%',
           height:130,
           marginRight:60, 
           backgroundColor:'#FCF3CF',
           borderWidth:3,
           borderStyle: 'dashed',
           borderColor:'red',
           textAlign:'center'
           }}>
            <h3 style={{marginTop:10}}>342</h3>
            <p style={{marginTop:30}}>Total Candidates</p>
           </CCol>

        <CCol sm="auto" style={{ 
          width:'20%',
          height:130, 
          marginLeft:1, 
          backgroundColor:'#E8DAEF',
          borderWidth:3,
          borderStyle: 'dashed',
          borderColor:'red',
          textAlign:'center'
          }}>
            <h3 style={{marginTop:10}}>342</h3>
            <p style={{marginTop:30}}>Candidates in Process</p>
        </CCol>

        <CCol sm="auto" style={{ 
          width:'20%', 
          height:130, 
          marginTop:30, 
          marginRight:60,
          backgroundColor:'#EBDEF0',
          borderWidth:3,
          borderStyle: 'dashed',
          borderColor:'red',
          textAlign:'center'
          }}>
            <h3 style={{marginTop:10}}>342</h3>
            <p style={{marginTop:30}}>Candidates Offered</p>
        </CCol>

        <CCol sm="auto" style={{ 
          width:'20%', 
          height:130, 
          marginTop:30, 
          backgroundColor:'#D4EFDF',
          borderWidth:3,
          borderStyle: 'dashed',
          borderColor:'red',
          textAlign:'center'
          }}>
          <h3 style={{marginTop:10}}>342</h3>
          <p style={{marginTop:30}}>Candidates Joined</p>
          </CCol>
        
      </CRow>

      <div style={{ 
          marginTop:130,
          display:'flex',
          justifyContent:'space-between',
          paddingBottom:300,
         }}>
          
      <div
      style={{ 
        width:'60%',
        }}>
         <Chart />
        </div>

        <div style={{ 
          width:'40%',
          marginTop:-160
          }}>
            <div>
            <PCharts />
            </div>
            
            <div 
            style={{ 
              marginTop:50,
            }}>
            <PCharts />
            </div>
             

        </div> 
            
            

      </div>
    </CContainer>
    </>
  )
}

export default Dashboard1