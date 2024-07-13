import { CFormCheck, CButton } from "@coreui/react"
import React from "react"

export const userData = [
    { 
     select: <CFormCheck id="flexCheckDefault" />, 
     id: 1, 
     name: 'Samppa Nori', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', 
     status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold',border:'2px solid blue' }}>View Details</CButton>, 
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%' ,fontWeight:'bold', border:'2px solid blue'}}>upload_documents</CButton>
    },

    {  
     select: <CFormCheck id="flexCheckDefault" />,  
     id: 2, 
     name: 'Estavan Lykos', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', 
     status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold' ,border:'2px solid blue'}}>View Details</CButton>,
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%' ,fontWeight:'bold',border:'2px solid blue'}}>upload_documents</CButton>
    },
    {  
     select: <CFormCheck id="flexCheckDefault" />,
     id: 3, 
     name: 'Chetan Mohamed', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold' ,border:'2px solid blue'}}>View Details</CButton>,
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%',fontWeight:'bold',border:'2px solid blue' }}>upload_documents</CButton>
    },
    {  
     select: <CFormCheck id="flexCheckDefault" />,  
     id: 4, 
     name: 'Derick Maximinus', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%' ,fontWeight:'bold',border:'2px solid blue'}}>View Details</CButton>, 
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%' ,fontWeight:'bold',border:'2px solid blue'}}>upload_documents</CButton>
    },
    {  
     select: <CFormCheck id="flexCheckDefault" />,  
     id: 5, 
     name: 'Friderik Dávid', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%' ,fontWeight:'bold',border:'2px solid blue'}}>View Details</CButton>, 
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%',fontWeight:'bold',border:'2px solid blue' }}>upload_documents</CButton>
    },
    {  
     select: <CFormCheck id="flexCheckDefault" />,  
     id: 6, 
     name: 'Yiorgos Avraamu', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold',border:'2px solid blue' }}>View Details</CButton>, 
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%' ,fontWeight:'bold',border:'2px solid blue'}}>upload_documents</CButton>
    },
    {  
     select: <CFormCheck id="flexCheckDefault" />,  
     id: 7, 
     name: 'Avram Tarasios', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%',fontWeight:'bold',border:'2px solid blue' }}>View Details</CButton>, 
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%',fontWeight:'bold',border:'2px solid blue' }}>upload_documents</CButton>
    },
    {  
     select: <CFormCheck id="flexCheckDefault" />,  
     id: 8, 
     name: 'Quintin Ed', 
     job_id: '654321', 
     ruseme_posted_on: '12 may 2022', status: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '75%' ,fontWeight:'bold',border:'2px solid blue'}}>View Details</CButton>, 
     upload_documents: <CButton component="a" color="primary" href="" variant="outline" style={{ fontSize: '12px', width: '100%',fontWeight:'bold',border:'2px solid blue' }}>upload_documents</CButton>
    },
    
]

export const fields = [
    { key: 'select', _style: { width: '10%', backgroundColor: '#c6cdcf' }, label: 'Select' },
    { key: 'id', _style: { width: '13%', backgroundColor: '#c6cdcf' }, label: 'Candidate Id' },
    { key: 'name', _style: { width: '17%', backgroundColor: '#c6cdcf' }, label: 'Candidate Name' },
    { key: 'job_id', _style: { width: '18%', backgroundColor: '#c6cdcf' }, label: 'Job Posting ID' },
    { key: 'ruseme_posted_on', _style: { width: '14%', backgroundColor: '#c6cdcf' }, label: 'Resume Posted On' },
    { key: 'ruseme_posted_on', _style: { width: '14%', backgroundColor: '#c6cdcf' }, label: 'Status' },
    { key: 'status', _style: { width: '14%', backgroundColor: '#c6cdcf' }, label: 'View Details' },
    
]
