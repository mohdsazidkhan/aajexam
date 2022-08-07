import React, {useState} from "react";
import './login.css';
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../includes/Header/Header";

const Login = () => {
    
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email : '',
        password : '',
    })

    const handleChange = e => {
        const {name, value} = e.target;
        setUser({
            ...user,
            [name] : value,
        })
    }

    const login = () => {
        if(user.email !== '' && user.password !== ''){
        axios.post('http://localhost:4000/login', user)
            .then(res => {
                if(res){
                    toast(res.data.message);
                    localStorage.setItem("loggedIn", true)
                    localStorage.setItem("userId", res.data.data[0].id)
                    localStorage.setItem("userRole", res.data.data[0].role)
                    localStorage.setItem("userName", res.data.data[0].name)
                    localStorage.setItem("userEmail", res.data.data[0].email)
                    localStorage.setItem("userPhone", res.data.data[0].phone)
                    if(res.data.data[0].role === "admin"){
                        window.location.href = "/admin";
                    }else{
                        window.location.href = "/";
                    }
                }
                
            })
        }else{
            toast("Please Fill All the Fields");
        }
    }


    return(
        <div className="AppContainer">
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
            <div className="login"> 
                <h1>Login</h1> 
                <input type="text" name="email" value={user.email} onChange={handleChange} placeholder="Enter Your Email ID" required/>
                <input type="password" name="password" value={user.password} onChange={handleChange} placeholder="Enter Your Password" required/>
                <div className="button" onClick={login}>Login</div>
                <div className="or">OR</div>
                <div className="button" onClick={() => navigate('/register')}>Register</div>
            </div>
        </div>
    )
}

export default Login;