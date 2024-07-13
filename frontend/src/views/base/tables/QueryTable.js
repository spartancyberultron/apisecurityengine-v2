


import React from 'react'
import {  CButton, CTable, } from '@coreui/react'
import { userData, fields } from './queryTableData';

const QueryTable = () => {

    return (
            <div>
                <div style={{ marginBottom: '2rem' }}>
                 <div style={{display:'flex',marginBottom:"4%",marginTop:"1%"}}>
                    <h2>Query Management</h2>
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

export default QueryTable