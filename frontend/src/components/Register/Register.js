import React, {useState} from "react";
import './register.css';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../includes/Header/Header";
import validator from 'validator'

const Register = () => {
    
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

    const register = () => {
        const {name, email, phone, role, password, confirmPassword} = user
        if(name && email && phone && role && password && (password === confirmPassword)){
            axios.post('http://localhost:4000/register', user)
            .then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/login')
                }
            })
        }else{
            toast("Invalid Input");
        }
    }
    
    return(
        <div className="AppContainer">
            <Header/>     
            <div className="register">
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
            <h1>Register</h1> 
            <input type="text" name="name" value={user.name} onChange={handleChange} placeholder="Enter Your Name" required/>
            <input type="email" name="email" value={user.email} onKeyUp={validateEmail} onChange={handleChange} placeholder="Enter Your Email" required/>
            <div style={{fontWeight: 'bold',color: 'red',}}>{emailError}</div>
            <input type="tel" name="phone" value={user.phone} onKeyUp={validatePhone} onChange={handleChange} placeholder="Enter Your Phone No." required/>
            <div style={{fontWeight: 'bold',color: 'red',}}>{phoneError}</div>
            <input type="password" name="password" value={user.password} onChange={handleChange} placeholder="Enter Password" required/>
            <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} placeholder="Confrim Password" required/>
            <div className="button" onClick={register}>Register</div>
            <div className="or">OR</div>
            <div className="button" onClick={() => navigate('/login')}>Login</div>
            </div>
        </div>
    )
}

export default Register;