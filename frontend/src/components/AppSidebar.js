import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sideBarHandler } from 'src/store/sideBar/actions'

import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import logo from '../assets/images/apisec_engine_logo.png'

import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import './style.css'


// sidebar nav config
import {_nav1,_nav2, _nav3} from '../_nav';


const AppSidebar = () => {

  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidbarReducer.sidebarShow)
  const sideBarSpec = useSelector((state) => state.loginInfo.loginInfo.user?.roles);

  const localData = JSON.parse(localStorage.getItem("user"));

  const authUser = sideBarSpec || localData?.user.userType;

  const navFunction = () => {

    switch (authUser) {
      case 'user':
        return _nav1      
      case 'admin':
        return _nav3
      default:
        return _nav1;
    }
  }

  const handleSidebar = (e) => {
    dispatch(sideBarHandler(!e))
  }

  return (

    <CSidebar style={{background:"#ffffff", color:"#000000", width:'15%', marginTop:100}}
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        handleSidebar(!visible)
      }}
    >
     
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navFunction()} />
        </SimpleBar>
      </CSidebarNav>
      
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
