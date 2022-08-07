import React from 'react'
import {Link} from 'react-router-dom';
import './footer.css'

function Footer() {
    return (
    <footer className="pt-5">
        <div className="container">
            <div className="row g-4">
                <div className="col-lg-3">
                    <Link className="navbar-brand me-0" to="/">
                        <img alt="Logo" src={require('../../assets/aajexam.png')} />
                    </Link>
                    <p className="my-3">AAJEXAM is a Education Platform, built specifically for preparation for your all Exams.</p>
                    
                    <ul className="list-inline mb-0 mt-3">
                        <li className="list-inline-item"> 
                        <Link className="btn btn-white btn-sm px-2 facebook" to="/">
                            <img alt="Facebook" src={require('../../assets/facebook.png')} />
                        </Link> 
                        </li>
                        <li className="list-inline-item"> 
                        <Link className="btn btn-white btn-sm px-2 instagram" to="/">
                            <img alt="Instagram" src={require('../../assets/instagram.png')} />
                        </Link> 
                        </li>
                        <li className="list-inline-item"> 
                        <Link className="btn btn-white btn-sm px-2 twitter" to="/">
                            <img alt="Twitter" src={require('../../assets/twitter.png')} />
                        </Link> 
                        </li>
                        <li className="list-inline-item"> 
                        <Link className="btn btn-white btn-sm px-2 linkedin" to="/">
                            <img alt="Linkedin" src={require('../../assets/linkedin.png')} />
                        </Link> 
                        </li>
                        <li className="list-inline-item"> 
                        <Link className="btn btn-white btn-sm px-2 youtube" to="/">
                            <img alt="Youtube" src={require('../../assets/youtube.png')} />
                        </Link> 
                        </li>
                    </ul>
                </div>
            
                <div className="col-lg-6">
                    <div className="row g-4">
                        
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <h5 className="mb-2 mb-md-4">Company</h5>
                            <ul className="nav flex-column">
                                <li className="nav-item"><Link className="nav-link" to="/about-us">About US</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/contact-us">Contact US</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/blogs">Blogs</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Library</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Career</Link></li>
                            </ul>
                        </div>
                                        
                        
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <h5 className="mb-2 mb-md-4">Community</h5>
                            <ul className="nav flex-column">
                                <li className="nav-item"><Link className="nav-link" to="/">Documentation</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Faq</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Forum</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Sitemap</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Help</Link></li>
                            </ul>
                        </div>

                        
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <h5 className="mb-2 mb-md-4">Learning</h5>
                            <ul className="nav flex-column">
                                <li className="nav-item"><Link className="nav-link" to="/register">Become a Student</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/courses">How to Learn</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/quizzes">Take the Quiz</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/exams">Ready for Exam</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/">Terms &amp; Conditions</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                
                <div className="col-lg-3">
                    <h5 className="mb-2 mb-md-4">Contact</h5>

                    <p className="mb-1">
                        Address: 
                        <p className="h6 fw-light">E-403/B, Block-E,</p>
                        <p className="h6 fw-light">Jaitpur Extn. Part-2,</p>
                        <p className="h6 fw-light">Badarpur, New Delhi - 110044</p>
                    </p>
                    
                    <p className="mb-1">
                        Call US: <span className="h6 fw-light ms-2">+91-7678 131 912</span>
                    </p>
                    <p className="mb-1">
                        Timings: <span className="h6 fw-light ms-2">9:AM to 9:PM IST</span>
                    </p>

                    <p className="mb-0">Email:<span className="h6 fw-light ms-2">aajexam@gmail.com</span></p>

                </div> 
                
            </div>

            <hr className="mt-2 mb-0"/>

            <div className="container px-0">
                <div className="d-md-flex justify-content-between align-items-center py-3 text-center text-md-left">
                
                    <div className="text-primary-hover">Copyrights ©2021 AajExam. All rights reserved. </div>
                    
                    <div className=" mt-3 mt-md-0">
                        <ul className="list-inline mb-0">
                            <li className="list-inline-item"><Link className="nav-link" to="/">Terms of Use</Link></li>
                            <li className="list-inline-item"><Link className="nav-link pe-0" to="/">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    )
}

export default Footer
