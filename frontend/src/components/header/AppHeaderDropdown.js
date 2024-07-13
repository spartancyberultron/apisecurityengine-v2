import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/8.jpg'
import { useParams, useNavigate } from 'react-router-dom'


const AppHeaderDropdown = () => {

  const navigate = useNavigate()

  const logout = async() => {
     localStorage.removeItem("user");
     localStorage.clear();
    
     window.location.replace('/');
  }


  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">

        <CDropdownItem href="/my-profile" style={{display:'none'}}>
          <CIcon icon={cilUser} className="me-2" />
          My Profile
        </CDropdownItem>
        <CDropdownDivider/>

        <CDropdownItem onClick={logout}>
          <CIcon icon={cilAccountLogout} className="me-2" style={{color:'white'}} />
          <span style={{color:'white'}}>Logout</span>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
