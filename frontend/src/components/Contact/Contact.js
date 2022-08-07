import React, {useState} from "react";
import './contact.css';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";

const Contact = () => {
    
    const navigate = useNavigate();

    const [contact, setContact] = useState({
        name : '',
        email : '',
        phone : '',
        subject : '',
        message : ''
    })

    const handleChange = e => {
        const {name, value} = e.target;
        setContact({
            ...contact,
            [name] : value,
        })
        

    }

    const contactUs = () => {
        const {name, email, phone, subject, message} = contact
        if(name && email && phone && subject && message){
            axios.post('http://localhost:4000/contact', contact)
            .then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/')
                }
            })
        }else{
            toast("Invalid Input");
        }
    }
    
    return(
        <div className="AppContainer">
            <Header/>     
            <div className="contact">
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
            <h1>Contact</h1> 
            <input type="text" name="name" value={contact.name} onChange={handleChange} placeholder="Enter Your Name"/>
            <input type="email" name="email" value={contact.email} onChange={handleChange} placeholder="Enter Your Email"/>
            <input type="text" name="phone" value={contact.phone} onChange={handleChange} placeholder="Enter Your Phone No."/>
            <input type="text" name="subject" value={contact.subject} onChange={handleChange} placeholder="Enter Subject"/>
            <textarea name="message" rows={4} cols={22} value={contact.message} onChange={handleChange} placeholder="Enter Message"/>
            <div className="button" onClick={contactUs}>Submit</div>
            </div>
            <Footer/>
        </div>
    )
}

export default Contact;