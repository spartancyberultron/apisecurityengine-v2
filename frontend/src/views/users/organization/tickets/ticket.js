import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom'

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CRow,
  CFormLabel,
  CFormSelect,
  CTextarea
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ShimmerTable } from "react-shimmer-effects";


const Ticket = () => {

  const navigate = useNavigate()
  const location = useLocation();

  const [updateText, setUpdateText] = useState("")
  const [attachments, setAttachments] = useState([])
  const [theStatus, setTheStatus] = useState("")
 
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)  

  const [users, setUsers] = useState([])
  const [assignedTo, setAssignedTo] = useState({})
  

  const [ticket, setTicket] = useState({})
  const [ticketId, setTicketId] = useState("")  

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const toaster = useRef();   

  const handleFileChange = (event) => {

    const selectedFiles = event.target.files;
    setAttachments(selectedFiles);
  };

  useEffect(() => {

    window.scrollTo(0, 0);

    var arr = location.search.split('=');

    var theTicketId = arr[1];

    setTicketId(theTicketId);

    fetchUsers();

    loadTicketDetails(theTicketId);

  }, []); 


  const loadTicketDetails = async (theTicketId) => {

    setLoading(true);

    const data = {
      ticketId: theTicketId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get('api/v1/organizations/getTicketDetails/'+theTicketId, {
      headers: { Authorization: `Bearer ${token}` },
    });


    setTicket(response.data.ticket); 
    setTheStatus(response.data.ticket.status)   

    setLoading(false);
  };


  const fetchUsers = async () => {

    setLoading(true);

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/organizations/getOrganizationUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(response.data.users);

    if (response.data.users.length > 0) {
      setAssignedTo(response.data.users[0]._id)
    } else {
      setAssignedTo('');
    }

    setLoading(false);
  };  


  const addTicketUpdate = () => {

    if (updateText === '') {

      setValidationFailed(true);
      setErrorText('Please add an update.');

    } else if (assignedTo === '') {

      setValidationFailed(true);
      setErrorText('Please assign the ticket to a user');

    } else {

      setLoading(true)      

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('ticketId', ticket._id);
      formData.append('updateText', updateText);
      formData.append('assignedTo', assignedTo);
      formData.append('status', theStatus);

      // Append each file individually
      for (let i = 0; i < attachments.length; i++) {
        formData.append('ticketUpdateAttachments', attachments[i]);
      }

     console.log('ticketUpdateAttachments:',attachments)
     const headers = new Headers();
     headers.append('Authorization', `Bearer ${bearerToken}`);
      

      // Make the API call
      fetch(global.backendUrl+'/api/v1/organizations/addTicketUpdate', {
        method: 'POST',        
        headers: headers,
        body: formData
      })
      .then(response => response.json())
      .then(data => {

        // Handle the API response

        if(data.hasOwnProperty('error')){
           setValidationFailed(true);
           setErrorText(data.error);
           setLoading(false);
        }
        else if(data.hasOwnProperty('err')){
          setLoading(false);
          setValidationFailed(true);
          setErrorText("Something went wrong. Please try again");
          
       }else{

           setSubmissionSuccess(true);
           setLoading(false);

           toast('Ticket updated', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
          });
    

           // Move to active scans window in 1 second
           setTicket(data.ticket);
           setUpdateText('');
           setAttachments([]);
        }

      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });

      

    }   

  }


  const goBack = (e) => {

    e.preventDefault();
    navigate('/tickets')
  }


  return (
    <div style={{ display: 'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <div style={{ width: '80%' }}>
        <div>
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h3 className="pageHeader">Ticket #{ticket.ticketId}</h3>
            <CButton
              onClick={goBack}
              style={{
                width: 300,
                marginBottom: '2%',
                marginRight: 20,
                borderWidth: 0,
                fontSize: 15,
                borderColor: '#000',
                borderWidth: 1,
                color: '#000',
                background: 'transparent'
              }}
              color="primary"
              className="px-3"
            >
              <IoMdArrowRoundBack size={20} style={{ color: '#000', marginRight: 10 }} />
              Back to Tickets
            </CButton>
          </div>

        {!loading ?
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom:30, backgroundColor: '#252B3B', padding: 15 }}>

            <h4 style={{color:'#fff'}}>{ticket.title}</h4>
            <p style={{color:'#fff'}}>{ticket.description}</p>


          {ticket.status == 'OPEN' &&
            <span style={{background:'red', color:'#fff', borderRadius:5, padding:5, width:100, textAlign:'center'}}>{ticket.status}</span>
          }

          {ticket.status == 'RESOLVED' &&
            <span style={{background:'green', color:'#fff', borderRadius:5, padding:5, width:100, textAlign:'center'}}>{ticket.status}</span>
          }

            <span style={{color:'#fff',marginTop:15, fontSize:13}}>Assigned To: {ticket.assignedTo?ticket.assignedTo.firstName + ' ' + ticket.assignedTo.lastName:''}</span>
            <span style={{color:'#fff',marginTop:15, fontSize:13}}>Opened At: {(new Date(ticket.createdAt)).toLocaleDateString()} {(new Date(ticket.createdAt)).toLocaleTimeString()}</span>

          </div>
          :

          <ShimmerTable row={8} col={10} />
}


      {!loading ?

          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom:30, backgroundColor: '#252B3B', padding: 15 }}>


          {ticket.ticketUpdates && ticket.ticketUpdates.map((update, index) => (

            <div style={{ backgroundColor: '#251C3B', padding: 15, marginTop:10}}>
            <p key={index} style={{ color: 'white' }}>{update.updateText}</p>

            <div >
            <span key={index} style={{ color: 'white', fontSize:13 }}>Updated By: {update.updatedBy.firstName} {update.updatedBy.lastName}</span><br/>
            <span key={index} style={{ color: 'white', fontSize:13 }}>Updated At: {(new Date(update.createdAt)).toLocaleDateString()} {(new Date(update.createdAt)).toLocaleTimeString()}</span>
            </div>
            </div>
          ))}

          </div>
          :
          <ShimmerTable row={8} col={10} />
      }


          {loading ?
            <ShimmerTable row={8} col={10} />
          :



          <div style={{ width: '100%', backgroundColor: '#252B3B', padding: 15 }}>

            <CFormLabel htmlFor="formTextarea" style={{ marginTop: 30, color: 'white' }}>Add update below</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <textarea
                id="formTextarea"
                placeholder="Add update here"
                autoComplete="updateText"
                className="form-control white-input"
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                style={{ width: '100%', resize: 'vertical', minHeight: '100px' }}
              />
            </CInputGroup>


            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white' }}>Add file(s)</CFormLabel><br/>

            <CInputGroup className="" style={{ flexDirection: 'column', }}>
              <CFormInput
                placeholder="Upload files(s)"
                autoComplete="username"
                type="file" 
                className="white-input"
                size="sm"
                id="inputFile"
                multiple
                onChange={handleFileChange}
                style={{ width: '100%' }}
              />
 {validationFailed &&

<text style={{color:'red', paddingTop:15}}>{errorText}</text>
}

</CInputGroup>    



            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: 'white' }}>Status</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormSelect
                id="theStatus"
                className="white-input"
                value={theStatus}
                onChange={(e) => setTheStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                  <option value="OPEN">
                    OPEN
                  </option>
                  <option value="IN PROGRESS">
                    IN PROGRESS
                  </option>
                  <option value="ON HOLD">
                    ON HOLD
                  </option>
                  <option value="OPEN">
                    RESOLVED
                  </option>
                
              </CFormSelect>
            </CInputGroup>     


            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: 'white' }}>Assigned To</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormSelect
                id="assignedTo"
                className="white-input"
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: '100%' }}
              >
                {users.map(user => {
  // Check if the user has an orgProject that matches ticket.orgProject._id
  const hasMatchingOrgProject = user.orgProjects.some(orgProject => orgProject._id === ticket.orgProject._id);

  return (
    <option 
      key={user._id} 
      value={user._id}
      style={{ display: hasMatchingOrgProject ? 'block' : 'none' }} // Optionally hide if no match
    >
      {user.firstName} {user.lastName} ({user.email})
    </option>
  );
})}
              </CFormSelect>
            </CInputGroup>    




            <CButton
              style={{
                width: '100%',
                marginTop: '3%',
                marginBottom: '2%',
                borderWidth: 0,
                fontSize: 20,
                background: '#89181b'
              }}
              color="primary"
              className="px-3"
              onClick={addTicketUpdate}
              disabled={loading}
            >


              {submitting ?
                <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                :
                'Submit Update'
              }


            </CButton>


          </div>
}


        </div>
      </div>

    </div>
  )
}

export default Ticket



