import React, {useState} from "react";
import './adduser.css';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import validator from 'validator'

const AddUser = () => {
    
    const navigate = useNavigate();

    const [emailError, setEmailError] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [user, setUser] = useState({
        name : '',
        email : '',
        phone : '',
        password : '',
        confirmPassword : '',
        role : 'student'
    })

    const validateEmail = (e) => {
        var email = e.target.value;
        if(email){
            if(validator.isEmail(email)) {
                setEmailError('Valid Email :)')
            }else{
                setEmailError('Enter Valid Email!')
            }
        }
    }

    const validatePhone = (e) => {
        var phone = e.target.value;
        if(phone){
            if(validator.isMobilePhone(phone)) {
                setPhoneError('Valid Phone No :)')
            }else{
                setPhoneError('Enter Valid Phone No')
            }
        }
    }

    const handleChange = e => {
        const {name, value} = e.target;
        setUser({
            ...user,
            [name] : value,
        })
    }

    const addUser = () => {
        const {name, email, phone, role, password, confirmPassword} = user
        if(name && email && phone && role && password && (password === confirmPassword)){
            axios.post('http://localhost:4000/adduser', user)
            .then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/users')
                }
            })
        }else{
            toast("Invalid Input");
        }
    }
    
    return(
        <div className="admin">
            <Header/>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-2 adminSidebar">
                        <Sidebar/>
                    </div>
                    <div className="col-sm-10 adminContent">
                        <div className="adduser">
                            <h1>Add New User</h1> 
                            <input type="text" name="name" value={user.name} onChange={handleChange} placeholder="Enter Your Name" required/>
                            <input type="email" name="email" value={user.email} onKeyUp={validateEmail} onChange={handleChange} placeholder="Enter Your Email" required/>
                            <div style={{fontWeight: 'bold',color: 'red',}}>{emailError}</div>
                            <input type="tel" name="phone" value={user.phone} onKeyUp={validatePhone} onChange={handleChange} placeholder="Enter Your Phone No." required/>
                            <div style={{fontWeight: 'bold',color: 'red',}}>{phoneError}</div>
                            <input type="password" name="password" value={user.password} onChange={handleChange} placeholder="Enter Password" required/>
                            <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} placeholder="Confrim Password" required/>
                            <div className="button" onClick={addUser}>Add User</div>
                        </div>
                    </div>
                </div>
            </div> 
            <Footer/>
        </div>
    )
}

export default AddUser;