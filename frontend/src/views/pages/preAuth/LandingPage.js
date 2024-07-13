import React from 'react'
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import logo from '../../../assets/images/apisec_engine_logo.png'
import image from '../../../assets/images/apisec-banner.jpg'
import bgImage from '../../../assets/images/apisec-banner.jpg'

import demoImage from '../../../assets/images/apisec-image.png'
import lightLogo from '../../../assets/images/apisec-light-logo.png'
import darkLogo from '../../../assets/images/apisec-light-logo.png'


import banner from '../../../assets/images/apisec-banner.jpg'
import banner2 from '../../../assets/images/apisec-banner-2.jpg'

import { useParams, useNavigate} from 'react-router-dom'
import { CgProfile } from "react-icons/cg"; // Profile
import { BiBuildingHouse } from "react-icons/bi"; //companies
import { FaHandshake } from "react-icons/fa"; //partners/alliance

import './landing.css';

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
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const LandingPage = () => {

    
    const navigate = useNavigate();    


    var loggedInUser = localStorage.getItem('ASIUser');
    
     return (

      <div>

      <div class="container banner-area" style={{paddingLeft:0, paddingRight:0}}>

      <nav id="navbar">
          <div class="nav-logo">

              <h1><a href="/">
                <img src={lightLogo} width="300"/>
                </a> </h1>
              <button>Menu</button>
          </div>
          <ul>       
            {loggedInUser?       
              <li className="menu-item"><a href="/user-dashboard">DASHBOARD</a> </li>
              :
              <li className="menu-item"><a href="/login">SIGN IN</a> </li>
            }
          </ul>
      </nav>

      <div class="content">

          <h1>APISecurityEngine</h1>
          <br/><br/><br/>
          <h3>Secure Your APIs With Our Comprehensive API Vulnerability Checker</h3>
          <hr/>
          <br/>
          <p>
          The platform evaluates API vulnerabilities in alignment with industry best practices, regulatory standards (such as NIST, CIS, OWASP, and PCI), 
          covering API endpoint vulnerabilities, including those unique to Web3. 
          Our scanning capabilities encompass both active and passive modes, API collection assessments through imported files, 
          and real-time traffic monitoring facilitated by specialized application layer agents tailored to your project.
          </p>
          <br/><br/>
          <button class='btn-solid '>LEARN MORE</button>

          <button class="btn-outline btn-contact-us">CONTACT US</button>

      </div>


  </div>

  <div class="context textcenter features-section">

      <h3 class="textgreen">FEATURES</h3>    

  </div>
  <hr/>

  <div class="container2" style={{background:'#252B3B'}}>

      <div class="fern">
          <img src={demoImage} alt=""/>
      </div>


      <div class="context2">

          <div class="ferncontext">
              <h3 class="lightertext">Proactive Security Scans:</h3>
              <p>APISecurityEngine empowers you with tailored, one-time security assessments. 
                It simplifies the process, enabling you to effortlessly submit API collection files in formats like Postman, Swagger, or OpenAPI
                 (in JSON or YAML). Our tool rigorously assesses each endpoint, identifies vulnerabilities, and delivers comprehensive, detailed 
                 reports on security risks</p>
          </div>
          
      </div>

  </div>
  <hr/>

  <div class="container2" style={{background:'#252B3B'}}>    


      <div class="context2">

          <div class="ferncontext">
              <h3 class="lightertext">Agent-Based Scans of API Traffic:</h3>
              <p>For deeper security coverage, our tool offers agent-based scans. By installing agents as middleware within your API project, 
                you can capture API traffic in real time. These agents support various programming languages like Java, 
                .NET, Go, Python, Node.js, and PHP, ensuring comprehensive vulnerability detection.</p>

          </div>
          
      </div>

      <div class="fern">
          <img src={demoImage} alt=""/>
      </div>
      
  </div>

  <hr/>


  <div class="container2" style={{background:'#252B3B'}}>

      <div class="fern">
          <img src={demoImage} alt=""/>
      </div>


      <div class="context2">

          <div class="ferncontext">
              <h3 class="lightertext">Middleware as Agent - for lighter footprint:</h3>
              <p>Our middleware agents operate seamlessly within your API project, ensuring minimal overhead.
                 They capture API traffic and transmit it securely to our tool for vulnerability assessment, 
                 allowing for robust security without compromising performance.</p>
          </div>
          
      </div>

  </div>
  <hr/>

  <div class="container2" style={{background:'#252B3B'}}>    


      <div class="context2">

          <div class="ferncontext">
              <h3 class="lightertext">Comprehensive Reporting:</h3>
              <p>Our reports are designed to provide you with a complete understanding of your API security posture. They come in both web and PDF formats and include visually informative charts, graphs, and tables, ensuring you have all the data you need to make informed decisions.</p>

          </div>
          
      </div>

      <div class="fern">
          <img src={demoImage} alt=""/>
      </div>
      
  </div>

  <hr/>

  <div class="container2" style={{background:'#252B3B'}}>

<div class="fern">
    <img src={demoImage} alt=""/>
</div>


<div class="context2">

    <div class="ferncontext">
        <h3 class="lightertext">Actionable Insights:</h3>
        <p>Our reports go beyond just identifying vulnerabilities. They offer actionable remediations for each security issue found, enabling your team to implement precise solutions quickly and effectively, strengthening your API security.</p>
    </div>
    
</div>

</div>
<hr/>



  <footer class="footer-section">
        <div class="container">
            
            <div class="footer-content pt-5 pb-5">
                <div class="row">

                    <div class="col-xl-6 col-lg-6 mb-50 follow-us">
                        <div class="footer-widget">
                            <div class="footer-logo">
                                <a href="index.html"><img src={darkLogo} class="img-fluid" alt="logo"/></a>
                            </div>
                            <div class="footer-text">
                                <p>Defend Your Business Against The Latest Cyber Threats</p>
                            </div>
                            <div class="footer-social-icon">
                                <span>Follow us</span>
                                <a href="#"><i class="fab fa-facebook-f facebook-bg"></i></a>
                                <a href="#"><i class="fab fa-twitter twitter-bg"></i></a>
                                <a href="#"><i class="fab fa-linkedin linkedin-bg"></i></a>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-6 col-lg-6 col-md-6 mb-30 useful-links">
                        <div class="footer-widget">
                            <div class="footer-widget-heading">
                                <h3>Useful Links</h3>
                            </div>
                            <ul>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Terms of Use</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                   
                </div>
            </div>


            <div class="footer-cta pt-5 pb-5">
                <div class="row">
                    
                    <div class="col-xl-6 col-md-6 mb-30">
                        <div class="single-cta">
                            <i class="fas fa-phone"></i>
                            <div class="cta-text">
                                <h4>Call Us</h4>
                                <span>+91 98454 47250</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-6 col-md-6 mb-30">
                        <div class="single-cta">
                            <i class="far fa-envelope-open"></i>
                            <div class="cta-text">
                                <h4>Email Us</h4>
                                <span>support@apisecurityengine.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            
        </div>

        <div class="copyright-area">
            <div class="container">
                <div class="row">
                    <div class="col-xl-12 col-lg-12 text-center text-lg-left">
                        <div class="copyright-text">
                            <p>Copyright &copy; 2023, All Right Reserved by <a href="https://apisecurityengine.com">APISecurityEngine</a></p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </footer>


  </div>
     
     )
}

export default LandingPage
