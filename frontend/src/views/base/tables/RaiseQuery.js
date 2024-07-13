import React from 'react'
import { useState,} from 'react'
import { CInputGroup, CFormSelect, CFormTextarea, CButton } from '@coreui/react'
import { raiseQueryDetails } from 'src/Services/api'

const initialQuery ={
queryCategory:"",
query:"",
}

const RaiseQuery = () => {

  const[query,setQuery]=useState(initialQuery)

  const onValueChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
}
  
const submitQuery = async ()=>{
  const res = await raiseQueryDetails(query);

}
    return (
      
   <div >
     <h5 style={{marginLeft:"20%",marginTop:"1%"}}>Raise a Query</h5>
    <div style={{margin:"auto",height:"50%", width:"60%",border:"2px solid orange",backgroundColor:"#ffedbd"}}>
     <h4 style={{marginLeft:"2%",marginTop:"1%",marginBottom:"1%"}}>Vendor Query Form</h4>
     <h6 style={{marginLeft:"2%",marginTop:"2%",marginBottom:"1%"}}>Query Category</h6>
     <div style={{width:"63%",marginLeft:"2%"}}>
     <CInputGroup className="mb-3">
  <CFormSelect id="inputGroupSelect01" name='queryCategory' onChange={(e)=>onValueChange(e)}>
    <option>Select Query Category</option>
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
  </CFormSelect>
</CInputGroup>
</div>
<h6 style={{marginLeft:"2%",marginTop:"2%",marginBottom:"1%"}}>Query</h6>
      <div  style={{width:"63%",marginLeft:"2%",marginBottom:"3%"}}>
      <CFormTextarea name='query' onChange={(e)=>onValueChange(e)}
      style={{height:'8rem'}}
  id="floatingTextarea"
  floatingLabel="Enter your Query Here"
  placeholder="Leave a comment here">
  </CFormTextarea>

  <div style={{width:"100%",marginTop:"6%"}}>
     <input className="form-control" type="file" id="formFileMultiple" multiple/>
</div>

      </div>
      <div style={{display:'flex',marginLeft:"2%",marginBottom:"3%"}}>
      <CButton style={{marginRight:"2%"}} color="primary" onClick={()=>submitQuery()}>Submit Query</CButton>
      <CButton color="light">Back</CButton>
        
      </div>


    </div>
   </div>
  )
}

export default RaiseQuery