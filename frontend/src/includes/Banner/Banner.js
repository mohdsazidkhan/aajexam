import React from 'react'
import './banner.css'
import {Link} from 'react-router-dom';

function Banner() {
    return (
        <div className="banner">
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">
                        <div className='banner_content'>
                            <h1>Prepare Your Exam Today</h1>
                            <p>India's best online learning platform to help you acquire new skills for clear your exam today</p>
                            <Link className='banner_btn' to='/exams'>Prepare Now</Link>
                        </div>
                    </div>
                    <div className='col-sm-6'>
                        <div className='bannerimg'>
                           <img alt="banner img" src={require('../../assets/bannerimg.png')} />
                        </div>
                    </div>
                </div>
            </div>             
        </div>
    )
}

export default Banner
