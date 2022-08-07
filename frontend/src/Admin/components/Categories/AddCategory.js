import React, { useState } from "react";
import './addcategory.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';


function AddCategory() {

    const navigate = useNavigate();

    const [name, setName] = useState('');

    const handleSubmit = (e) => {

        e.preventDefault();

        if(name){
            axios.post('http://localhost:4000/addcategory', {
                name
            }).then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/categories')
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    const handleChange = (e) => {
        setName(e.target.value);
    }

    return (
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
                    <div className="col-sm-10  adminContent addCategory">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Add New Category</h1>
                            </div>
                            <div className="col-sm-12">
                            <form className="row" onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className="col-sm-6">
                                <input 
                                    type="text"
                                    placeholder="Enter Category Name"
                                    name="name"
                                    className='form-control mb-2'
                                    value={name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    className='button'
                                    type="submit"
                                    value={'Submit'}
                                />
                            </div>
                            </form>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default AddCategory
