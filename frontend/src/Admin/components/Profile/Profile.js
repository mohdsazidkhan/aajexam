import React from 'react'
import './profile.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';

function Profile() {

    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const phone = localStorage.getItem("userPhone");
    const role = localStorage.getItem("userRole");

    return (
        <div className="admin">
            <Header/>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-2 adminSidebar">
                        <Sidebar/>
                    </div>
                    <div className="col-sm-10 adminContent">
                        <div className='profile'>
                            <h1>Profile</h1>
                            <h3>Name: {name}</h3>
                            <h3>Email: {email}</h3>
                            <h3>Phone No.: {phone}</h3>
                            <h3>Role: {role}</h3>
                        </div>
                    </div> 
                </div>
            </div>
            <Footer/>
        </div>
                    
         
    )
}

export default Profile
