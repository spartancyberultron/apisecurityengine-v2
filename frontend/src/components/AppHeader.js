import React, { useEffect, useState, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'

import { Link } from "react-router-dom";
import Modal from 'react-modal';

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { sideBarHandler } from 'src/store/sideBar/actions'
import lightLogo from '../assets/images/apisec-light-logo.png'
import axios from 'axios'
import logo from '../assets/images/apisec_engine_logo.png'


import { AiFillDashboard } from "react-icons/ai";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { AiFillRobot } from "react-icons/ai";
import { GrCloudComputer } from "react-icons/gr";
import { TbApiApp } from "react-icons/tb";
import { GrAlert } from "react-icons/gr";
import { BsCardText } from "react-icons/bs";
import { GrSettingsOption } from "react-icons/gr";
import { useLocation } from 'react-router-dom'
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { FiAlertCircle } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFillBellFill } from "react-icons/bs";

const AppHeader = () => {

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidbarReducer.sidebarShow)
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isActiveRoute, setIsActiveRoute] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');
  const [notiPanelVisible, setNotiPanelVisible] = useState(false);

  const [refreshFlag, setRefreshFlag] = useState(false);
  const [user, setUser] = useState(null);

  const [clickedOutside, setClickedOutside] = useState(false);
  const [last10Alerts, setLast10Alerts] = useState([]);

  const myRef = useRef();

  const location = useLocation();

  useEffect(() => {

    setCurrentRoute(location.pathname);
    getUserDetails();

  }, [])

  useEffect(() => {

    setCurrentRoute(location.pathname);
    getLast10Alerts();

  }, [refreshFlag])


  const getUserDetails = () => {

    console.log('JSON.parse(localStorage.getItem(ASIUser)):',JSON.parse(localStorage.getItem('ASIUser')))

    setUser(JSON.parse(localStorage.getItem('ASIUser')));
  }

  const getLast10Alerts = () => {

    // Set from localStorage cache
    if (localStorage.getItem('dashboardData')) {
      setLast10Alerts(JSON.parse(localStorage.getItem('last10Alerts')));
    }

    const endpoint = 'api/v1/users/getLast10Alerts';
    const token = localStorage.getItem('ASIToken');

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {

        setLast10Alerts(response.data.activeScanVulnsArray);

        // Save into local storage to show from cache while it loads next time
        localStorage.setItem('last10Alerts', JSON.stringify(response.data.activeScanVulnsArray));

      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      });
  }


  const toggleRefreshFlag = () => {
    setRefreshFlag(!refreshFlag);
  }

  const toggleNotiPanel = () => {
    setNotiPanelVisible(!notiPanelVisible);
  }

  const handleClickOutside = e => {

    if (myRef.current && !myRef.current.contains(e.target)) {
      setNotiPanelVisible(false);
    }
  };

  const handleClickInside = () => setClickedOutside(false);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  console.log('user:',user)


  return (
    <CHeader position="sticky" className="mb-4" style={{height:100}}>

      <CContainer fluid className="header-primary">


{user && user.organization && user.organization.logoURL ?
          <img src={user.organization.logoURL} style={{ width: 100, alignSelf: 'center' }} alt="Organization Logo" />
:
<img src={logo} style={{ width: 100, alignSelf: 'center' }} alt="Organization Logo" />
}
    


        <div class="search-container" style={{ display: 'none' }}>
          <input type="text" class="search-input" placeholder="Search APISecurityEngine" />
          <AiOutlineSearch class="search-icon" size={22} color="#00BDC1" />
        </div>

        <CHeaderNav className="ms-5" style={{ width: 400, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginRight:20 }}>

          <CNavItem>
            <CNavLink href="#" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', pointerEvents:'none', marginTop:10 }}>
              <span className="header-welcome-text">Welcome, {user ? user.firstName : ''} {user ? user.lastName : ''}</span>
            </CNavLink>
          </CNavItem>          

          <AppHeaderDropdown style={{ marginLeft: 50 }} />
        </CHeaderNav>
      </CContainer>




      {notiPanelVisible &&

        <div ref={myRef}
          style={{ position: 'absolute', top: 70, background: '#7367f0', padding: 20, width: 400, maxHeight: 800, right: 40 }}>

          <>

            {last10Alerts.map((theAlert) => (


              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>{theAlert.vulnerability.vulnerabilityName}</span>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 'bold', fontStyle:'italic' }}>{theAlert.endpoint.host}</span>
                <span style={{ color: 'white', fontSize: 12, fontWeight: 'normal',  }}>{theAlert.endpoint.endpoint}</span>
                <span style={{ color: 'white', fontSize: 11, fontWeight: 'normal', marginTop: 5 }}>
                  {(new Date(theAlert.createdAt)).toLocaleDateString('en-US')} {(new Date(theAlert.createdAt)).toLocaleTimeString('en-US')}
                </span>
                <hr style={{ borderColor: 'white' }} />
              </div>

            ))}

          </>


        </div>
      }

    </CHeader>
  )
}

export default AppHeader
