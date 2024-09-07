import React, { useEffect, useState, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import { CBadge } from '@coreui/react'
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
import { Link } from "react-router-dom";
import { AiFillDashboard } from "react-icons/ai";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { AiFillRobot } from "react-icons/ai";
import { GrCloudComputer } from "react-icons/gr";
import { TbApiApp } from "react-icons/tb";
import { GrAlert } from "react-icons/gr";
import { BsCardText } from "react-icons/bs";
import { GrSettingsOption } from "react-icons/gr";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { FiAlertCircle } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFillBellFill } from "react-icons/bs";
import { GoOrganization } from "react-icons/go";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { GoCodescanCheckmark } from "react-icons/go";
import { FaTable } from "react-icons/fa";
import { MdModelTraining } from "react-icons/md";
import { GrCompliance } from "react-icons/gr";
import { GiHotSurface } from "react-icons/gi";


export const AppSidebarNav = ({ items }) => {

  const location = useLocation()

  const [refreshFlag, setRefreshFlag] = useState(false);
  const [user, setUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('');

  const toggleRefreshFlag = () => {
    setRefreshFlag(!refreshFlag);
  }

  const highLightMenu = (theRoute) => {

    setCurrentRoute(theRoute);
  }

  useEffect(() => {

    setCurrentRoute(location.pathname);
    getUserDetails();

  }, [])

  useEffect(() => {

    setCurrentRoute(location.pathname);

  }, [refreshFlag])


  const getUserDetails = () => {

    setUser(JSON.parse(localStorage.getItem('ASIUser')));
  }


  console.log('comes:',currentRoute)

  return (

    <div>

      <CContainer fluid className="header-menu">

        {user && user.userType == 'user' &&

          <div style={{ width: '100%', marginLeft: '0%', display: 'flex', flexDirection: 'column', }}>

            <Link to="/user-dashboard" onClick={toggleRefreshFlag}
              className="menuLink"
              style={{
                padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                background: currentRoute == '/user-dashboard' ? '#7367f0' : 'transparent', justifyContent: 'center'
              }}>

              <AiFillDashboard size={22} color={currentRoute == '/user-dashboard' ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{ marginLeft: 10, color: currentRoute == '/user-dashboard' ? '#fff' : '#5D596C' }}>Dashboard</span>
            </Link>


            <Link to="/api-inventory" onClick={toggleRefreshFlag}
              className="menuLink"
              style={{
                padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                background: (currentRoute.includes('api-inventory')
                  || currentRoute.includes('-collection')
                 
                ) ? '#7367f0' : 'transparent', justifyContent: 'center'
              }}>

              <BsFillLightningChargeFill size={22} color={(currentRoute.includes('api-inventory')
                || currentRoute.includes('-collection')
                ) ? '#fff' : '#b6bee3'} />

              <span className="headerText" style={{
                marginLeft: 10, color: currentRoute.includes('api-inventory')
                || currentRoute.includes('-collection')
                  ? '#fff' : '#5D596C'
              }}>
                API Inventory</span>
            </Link>



            <Link to="/active-scans" onClick={toggleRefreshFlag}
              className="menuLink"
              style={{
                padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                background: (currentRoute == '/active-scans'
                  || currentRoute == '/start-active-scan'
                  || currentRoute == '/view-active-scan-report'
                  || currentRoute == '/endpoints'
                ) ? '#7367f0' : 'transparent', justifyContent: 'center'
              }}>

              <BsFillLightningChargeFill size={22} color={(currentRoute == '/active-scans'
                || currentRoute == '/start-active-scan'
                || currentRoute == '/view-active-scan-report' || currentRoute == '/endpoints') ? '#fff' : '#b6bee3'} />

              <span className="headerText" style={{
                marginLeft: 10, color: currentRoute == '/active-scans'
                  || currentRoute == '/start-active-scan'
                  || currentRoute == '/view-active-scan-report'
                  || currentRoute == '/endpoints'
                  ? '#fff' : '#5D596C'
              }}>
                Scans</span>
            </Link>

            <Link to="/agents" onClick={toggleRefreshFlag}
              className="menuLink"
              style={{
                padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                background: currentRoute == '/agents' || currentRoute == '/add-agent'
                  || currentRoute == '/add-mirroring-project'
                  || currentRoute == '/edit-mirroring-project' || currentRoute == '/project-vulnerabilities' 
                  || currentRoute == '/project-inventory'
                  ? '#7367f0' : 'transparent', justifyContent: 'center'
              }}>

              <AiFillRobot size={22}
                color={currentRoute == '/agents'
                  || currentRoute == '/add-agent'
                  || currentRoute == '/add-mirroring-project'
                  || currentRoute == '/edit-mirroring-project'
                  || currentRoute == '/project-vulnerabilities'
                  || currentRoute == '/project-inventory'
                  ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: currentRoute == '/agents'
                  || currentRoute == '/add-agent'
                  || currentRoute == '/add-mirroring-project'
                  || currentRoute == '/edit-mirroring-project'
                  || currentRoute == '/project-vulnerabilities'
                  || currentRoute == '/project-inventory'
                  ? '#fff' : '#5D596C'
              }}>Mirroring Agents</span>
            </Link>

            <Link to="/endpoints" onClick={toggleRefreshFlag}
              className="menuLink"
              style={{
                padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none', display: 'none',
                background: currentRoute == '/endpoints' ? '#7367f0' : 'transparent', justifyContent: 'center'
              }}>

              <HiOutlineDesktopComputer size={22} color={currentRoute == '/endpoints' ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{ marginLeft: 10, color: currentRoute == '/endpoints' ? '#fff)' : '#5D596C' }}>Endpoints</span>
            </Link>



            <Link to="/alerts" onClick={toggleRefreshFlag}
              className="menuLink"
              style={{
                padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                background: currentRoute == '/alerts' ? '#7367f0' : 'transparent', justifyContent: 'center'
              }}>

              <TbApiApp size={22} color={currentRoute == '/alerts' ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{ marginLeft: 10, color: currentRoute == '/alerts' ? '#fff' : '#5D596C' }}>Alerts</span>
            </Link>



            <Link className="menuLink" to="/pii-data" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: (currentRoute == '/pii-data' || currentRoute == '/pii-data-details') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <FiAlertCircle size={22} color={(currentRoute == '/pii-data' || currentRoute == '/pii-data-details') ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute == '/pii-data' || currentRoute == '/pii-data-details')
                  ? '#fff' : '#5D596C'
              }}>PII Data</span>
            </Link>



            <Link className="menuLink" to="/soap-graphql-scans" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: (currentRoute.includes('soap-graphql-scan') || 
              currentRoute == '/view-soap-graphql-scan-report') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <GoCodescanCheckmark size={22} color={(currentRoute.includes('soap-graphql-scans') || 
              currentRoute == '/view-soap-graphql-scan-report') ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute.includes('soap-graphql-scan') || currentRoute == '/view-soap-graphql-scan-report')
                  ? '#fff' : '#5D596C'
              }}>SOAP/GraphQL Scans</span>
            </Link>


            <Link className="menuLink" to="/llm-scans" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: (currentRoute == '/llm-scans' || currentRoute == '/view-llm-scan-report') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <MdModelTraining size={22} 
                color={(currentRoute == '/llm-scans' || currentRoute == '/view-llm-scan-report') ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute == '/llm-scans' || currentRoute == '/view-llm-scan-report')
                  ? '#fff' : '#5D596C'
              }}>LLM Scans</span>
            </Link>



            <Link className="menuLink" to="/sbom-scans" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: (currentRoute == '/sbom-scans' || currentRoute == '/view-sbom-scan-report') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <AiOutlineSecurityScan size={22} color={(currentRoute == '/sbom-scan' || currentRoute == '/view-sbom-scan-report') ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute == '/sbom-scans' || currentRoute == '/view-sbom-scan-report')
                  ? '#fff' : '#5D596C'
              }}>SBOM Scans</span>
            </Link>


            <Link className="menuLink" to="/threat-modelling" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: (currentRoute == '/threat-modelling' 
              || currentRoute.includes('/threat-modelling-scan-report')) ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <FaTable size={22} color={(currentRoute == '/threat-modelling' 
              || currentRoute == '/threat-modelling-scan-report') ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute == '/threat-modelling' || currentRoute.includes('/threat-modelling-scan-report'))
                  ? '#fff' : '#5D596C'
              }}>Threat Modelling</span>
            </Link>


            <Link className="menuLink" to="/compliance-monitoring" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: (currentRoute == '/compliance-monitoring' 
              || currentRoute == '/compliance-monitoring') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <GrCompliance size={22} color={(currentRoute == '/compliance-monitoring' 
              || currentRoute == '/compliance-monitoring') ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute == '/compliance-monitoring' || currentRoute == '/compliance-monitoring')
                  ? '#fff' : '#5D596C'
              }}>Compliance Monitoring</span>
            </Link>

            <Link className="menuLink" to="/attack-surface-management" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: currentRoute.includes('attack-surface') 
               ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <GiHotSurface size={22} color={(currentRoute.includes('attack-surface') ) ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute.includes('attack-surface'))
                  ? '#fff' : '#5D596C'
              }}>Attack Surface Management</span>
            </Link>


            <Link className="menuLink" to="/integrations" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none',
              background: currentRoute.includes('integrations') 
               ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <GiHotSurface size={22} color={(currentRoute.includes('integrations') ) ? '#fff' : '#b6bee3'} />
              <span className="headerText" style={{
                marginLeft: 10, color: (currentRoute.includes('integrations'))
                  ? '#fff' : '#5D596C'
              }}>Integrations</span>
            </Link>



            <Link className="menuLink" to="/protection" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none', display: 'none',
              background: (currentRoute == '/protection' || currentRoute == '/protection') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <BsCardText size={22} color={currentRoute == '/protection' ? '#ffffff' : '#b6bee3'} />
              <span className="headerText" style={{ marginLeft: 10, color: currentRoute == '/protection' ? '#ffffff' : '#5D596C' }}>Protection</span>
            </Link>


            <Link className="menuLink" to="/organization" onClick={toggleRefreshFlag} style={{
              padding: 15, display: 'flex', flexDirection: 'row', textDecoration: 'none', 
              background: (currentRoute == '/organization' || currentRoute == '/organization') ? '#7367f0' : 'transparent', justifyContent: 'center'
            }}>

              <GoOrganization size={22} color={currentRoute == '/organization' ? '#ffffff' : '#b6bee3'} />
              <span className="headerText" style={{ marginLeft: 10, color: currentRoute == '/organization' ? '#ffffff' : '#5D596C' }}>Organization</span>
            </Link>

            <Link to="/users" onClick={() => highLightMenu('/users')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none', marginTop:10,
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('users') || currentRoute.includes('add-user') || currentRoute.includes('edit-user')) ? '#5141e0' : '#5D596C' }}>
                  Users</text>
              </Link>
              
              <Link to="/teams" onClick={() => highLightMenu('/teams')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('team')) ? '#5141e0' : '#5D596C' }}>
                  Teams</text>
              </Link>

              <Link to="/workspaces" onClick={() => highLightMenu('/workspaces')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('workspace') ? '#5141e0' : '#5D596C') }}>
                  Workspaces</text>
              </Link>


              <Link to="/projects" onClick={() => highLightMenu('/projects')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('project') ? '#5141e0' : '#5D596C') }}>
                  Projects</text>
              </Link>

              <Link to="/tickets" onClick={() => highLightMenu('/tickets')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('ticket') ? '#5141e0' : '#5D596C') }}>
                  Tickets</text>
              </Link>

              <Link to="/organization-settings" onClick={() => highLightMenu('/organization-settings')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('setting') ? '#5141e0' : '#5D596C') }}>
                  Settings</text>
              </Link>

              <Link to="/result-integrations" onClick={() => highLightMenu('/result-integrations')}
                className="menuLink"
                style={{
                  padding: 5, display: 'flex', flexDirection: 'row', textDecoration: 'none',
                   justifyContent: 'flex-start'
                }}>

                <text className="headerText" style={{ marginLeft: 40, fontSize:13, color: 
                  (currentRoute.includes('result-integration') ? '#5141e0' : '#5D596C') }}>
                  Result Integrations</text>
              </Link>

              <div style={{height:100}}></div>


          </div>
        }

      </CContainer>

    </div>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
