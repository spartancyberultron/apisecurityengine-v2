import { CFormCheck, CButton } from "@coreui/react"
import React from "react"

export const userData = [
    {
        id: 1,
         name: 'Samppa Nori', 
         registered: '1@example.com', 
         role: '96523', 
         status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold',border:'2px solid blue' }}>View Details</CButton>, 
         history: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%' ,fontWeight:'bold', border:'2px solid blue'}}>History</CButton>, 
         select: <CFormCheck id="flexCheckDefault" /> 
    },
     {   
         id: 2,
            name: 'Samppa Nori', 
            registered: '1@example.com', 
            role: '96523', 
            status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold',border:'2px solid blue' }}>View Details</CButton>, 
            history: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%' ,fontWeight:'bold', border:'2px solid blue'}}>History</CButton>, 
            select: <CFormCheck id="flexCheckDefault" /> 
           },
    
]

export const fields = [
   
    { key: 'id', _style: { width: '13%', backgroundColor: '#c6cdcf' }, label: 'Query Id' },
    { key: 'name', _style: { width: '17%', backgroundColor: '#c6cdcf' }, label: 'Query Type' },
    { key: 'registered', _style: { width: '18%', backgroundColor: '#c6cdcf' }, label: 'Raised on' },
    { key: 'role', _style: { width: '14%', backgroundColor: '#c6cdcf' }, label: 'Query Status' },
   
]
