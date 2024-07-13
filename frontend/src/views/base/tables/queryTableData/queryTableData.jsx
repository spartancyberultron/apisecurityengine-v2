


import React from 'react'
import { CCard, CCardBody, CCol, CForm, CFormCheck, CFormInput, CDataTable, CButton, CFormSelect, CTable, CTableBody, CTableHead } from '@coreui/react'
import { userData, fields } from './queryTableData';

const queryTable = () => {

    return (
        
        <div>
                <div style={{ marginBottom: '2rem' }}>
                 <div style={{display:'flex',marginBottom:"4%"}}>
                    <h2>Query Mnangement</h2>
                    <CButton color="primary" style={{fontWeight:'bold', fontSize:'14px', marginLeft:"64%"}}>Raise a Query</CButton>
                    </div>
                <CTable
                    style={{backgroundColor:'white', width:"98.3%" }}
                    bordered borderColor="secondary"
                    items={userData}
                    columns={fields}
                />
            </div>
            </div >
        
    )
}

export default queryTable