import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader, AppSidebarNav } from '../components/index'

const DefaultLayout = () => {
  return (
    <div>
     
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        
        <div className="body flex-grow-1 px-3" style={{display:'flex', flexDirection:'row'}}>
          <AppSidebar/>
          <AppContent />
        </div>       
      </div>
    </div>
  )
}

export default DefaultLayout
