import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';

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
  CFormSelect
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoCodescan } from "react-icons/go";
import axios from 'axios';
import { useLocation } from 'react-router-dom'


const EditTicket = () => {

  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("User Activity")
  const [priority, setPriority] = useState("Critical")
  const [note, setNote] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState('')  
  const [theStatus, setTheStatus] = useState('');
  const [attachments, setAttachments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [ticket, setTicket] = useState({})

  const [validationFailed, setValidationFailed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const toaster = useRef();
  const location = useLocation();

  function isExceeding100MB(file){

    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (fileSizeInMB > 1000) {
      //console.log('File size exceeds 8MB');
      return true;
    } else {
      //console.log('File size is within 8MB limit');
      return false;
    }
    
  }

  useEffect(() => {    

    fetchUsers();   

  }, []);

  useEffect(() => {

    window.scrollTo(0, 0);

    //setOnLoading(true);

    var arr = location.search.split('=');

    var theUserId = arr[1];

    setTicketId(theUserId);

    loadTicketDetails(theUserId);

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

    console.log('data:',response.data)

    

    setTicket(response.data.ticket);

    setTitle(response.data.ticket.title)
    setCategory(response.data.ticket.category)
    setPriority(response.data.ticket.priority)
    setDescription(response.data.ticket.description)
    setNote(response.data.ticket.note)
    setAssignedTo(response.data.ticket.assignedTo)
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



  const updateTicket = () => {

    if (title === '') {

      setValidationFailed(true);
      setErrorText('Title is required.');

    } else if (assignedTo === '') {

      setValidationFailed(true);
      setErrorText('Please assign the ticket to a user');

    } else if (description === '') {

      setValidationFailed(true);
      setErrorText('Please select the language of the project');

    } else {

      setLoading(true)      

      const bearerToken = localStorage.getItem('ASIToken');

      // Create a FormData object
      const formData = new FormData();
      formData.append('id', ticketId);
      formData.append('title', title);
      formData.append('assignedTo', assignedTo);
      formData.append('description', description);
      formData.append('status', theStatus);

      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('note', note);

      const body = {
        id:ticketId,
        title:title,
        assignedTo:assignedTo,
        description:description,
        status:theStatus,
        category:category,
        priority:priority,
        note:note
        
      }


      console.log('body:',body)

     // Append each file individually
    // for (let i = 0; i < attachments.length; i++) {
  //formData.append('ticketAttachments', attachments[i]);
//}

   //  console.log('ticketAttachments:',attachments)
     const headers = new Headers();
     headers.append('Authorization', `Bearer ${bearerToken}`);
     headers.append('Content-Type', 'application/json');
     // Set Content-Type to multipart/form-data and include the boundary     
      

      // Make the API call
      fetch(global.backendUrl+'/api/v1/organizations/editTicket', {
        method: 'POST',        
        headers: headers,
        body: JSON.stringify(body)
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
           navigate('/tickets')
        }

      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });      


    }   

  }
 

  const handleFileChange = (event) => {

    const selectedFiles = event.target.files;
    setAttachments(selectedFiles);
  };

  const goBack = (e) => {

    e.preventDefault();
    navigate('/tickets')
  }


  return (
    <div style={{ display:'flex', overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <div style={{ width: '60%' }}>
        <div>
          <div style={{ marginBottom: '0rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2 className="pageHeader">Editing ticket</h2>
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
                <IoMdArrowRoundBack size={20} style={{ color: '#000', marginRight:10 }} />
                Back to Tickets
              </CButton>
          </div>


          <div style={{ width: '100%', backgroundColor: '#fff', padding: 15 }}>

         
            <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white'  }}>Ticket Title</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>

              <CFormInput
                placeholder="Ticket Title"
                autoComplete="title"
                className="white-input"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                style={{ width: '100%' }}
              />


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white'  }}>Ticket Category</CFormLabel>

              <CFormSelect
                id="scanType"
                className="white-input"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                style={{ width: '100%' }}
              >
                  <option key="User Activity" value="User Activity">
                    User Activity
                  </option>

                  <option key="Support" value="Support">
                    Support
                  </option>

                  <option key="Network" value="Network">
                    Network
                  </option>


                  <option key="Vulnerability Management" value="Vulnerability Management">
                    Vulnerability Management
                  </option>

                  <option key="Endpoint" value="Endpoint">
                    Endpoint
                  </option>

                  <option key="Threat Management" value="Threat Management">
                    Threat Management
                  </option>

                  <option key="Compliance" value="Compliance">
                    Compliance
                  </option>

                  <option key="Phishing" value="Phishing">
                    Phishing
                  </option>

                  <option key="VPN" value="VPN">
                    VPN
                  </option>                  

                  <option key="Suspicious activity" value="Suspicious activity">
                    Suspicious activity
                  </option>
                
              </CFormSelect>


              <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'white'  }}>Priority</CFormLabel>

<CFormSelect
  id="scanType"
  className="white-input"
  onChange={(e) => setPriority(e.target.value)}
  value={priority}
  style={{ width: '100%' }}
>
    <option key="Critical" value="Critical">
      Critical
    </option>

    <option key="High" value="High">
      High
    </option>

    <option key="Medium" value="Medium">
      Medium
    </option>

    <option key="Low" value="Low">
      Low
    </option>

   


   
</CFormSelect>


          <CFormLabel htmlFor="formTextarea" style={{ marginTop: 30, color: 'white' }}>Description</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <textarea
                id="formTextarea"
                placeholder="Description"
                autoComplete="description"
                className="form-control white-input"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                style={{ width: '100%', resize: 'vertical', minHeight: '100px' }}
              />
            </CInputGroup>



          <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: 'white' }}>Assigned To</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormSelect
                id="assignedTo"
                className="white-input"
                onChange={(e) => setAssignedTo(e.target.value)}
                value={assignedTo}
                style={{ width: '100%' }}
              >
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}  ({user.email})
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>

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
                  <option value="RESOLVED">
                    RESOLVED
                  </option>
                
              </CFormSelect>
            </CInputGroup>     
          

            <CInputGroup className="" style={{ flexDirection: 'column', }}>
             


            <CFormLabel htmlFor="formTextarea" style={{ marginTop: 30, color: 'white' }}>Note</CFormLabel>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <textarea
                id="formTextarea"
                placeholder="Note"
                autoComplete="note"
                className="form-control white-input"
                onChange={(e) => setNote(e.target.value)}
                value={note}
                style={{ width: '100%', resize: 'vertical', minHeight: '100px' }}
              />
            </CInputGroup>


            {validationFailed &&

                <text style={{color:'red', paddingTop:15}}>{errorText}</text>
            }

            </CInputGroup>          
            


            <CButton
              style={{marginTop:30, width:'100%'}}              
              color="primary"
              className="primaryButton"
              onClick={updateTicket}
              disabled={loading}
            >          


              {loading ?
                            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                            :
                            'Update Ticket'
                          }


            </CButton>

          </div>


        </div>
      </div>

    </div>
  )
}

export default EditTicket