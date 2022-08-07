import React, { useState,useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import './addblog.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';


function AddBlog() {

    const author = localStorage.getItem("userName"); 
    const publishedAt = Date().toLocaleString()
    const [categoryName, setCategoryName] = useState('');

    const editor = useRef(null);

    const config = {
        readonly: false,
        height: 400
    };

    const [categories, setCategories] = useState([0]);
    
    const navigate = useNavigate();

    const [blog, setBlog] = useState(
        {
            name: '',
            author: '',
            publishedAt: '',
            categoryID: '',
            categoryName: '',
            photo: '',
            content: ''
        }
    );

    useEffect(() => {
        getCategories();
    }, [])

    const getCategories = () => {
        axios.get('http://localhost:4000/getcategories')
            .then(res => {
                if(res){
                    setCategories(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    const handleSubmit = (e) => {

        e.preventDefault();

        const formData = new FormData();

        formData.append('photo', blog.photo);
        formData.append('name', blog.name);
        formData.append('author', author);
        formData.append('publishedAt', publishedAt);
        formData.append('categoryID', blog.categoryID);
        formData.append('categoryName', categoryName);
        formData.append('content', blog.content);
        

        axios.post('http://localhost:4000/addblog', formData)
            .then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/blogs')
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    const handleChange = (e) => {
        setBlog({...blog, [e.target.name]: e.target.value});
    }

    const handleCategory = (e) => {
        setCategoryName(e.target.selectedOptions[0].text);
        setBlog({...blog, categoryID: e.target.value});
    }

    const handlePhoto = (e) => {
        setBlog({...blog, photo: e.target.files[0]});
    }

    const handleUpdate = (e) => {
        setBlog({...blog, content: e});
    };

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
                    <div className="col-sm-10  adminContent addBlog">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Add New Blog</h1>
                            </div>
                            <div className="col-sm-12">
                            <form className="row" onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Blog Title"
                                    name="name"
                                    className='form-control mb-2'
                                    value={blog.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-sm-6">
                                <input 
                                    type="file" 
                                    placeholder="Upload a Photo"
                                    accept=".png, .jpg, .jpeg"
                                    name="photo"
                                    className='form-control mb-2'
                                    onChange={handlePhoto}
                                />
                            </div>
                            <div className="col-sm-6">
                                <select value={blog.categoryID} className='form-control' name="category" onChange={handleCategory}>
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => {
                                    return(
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="col-sm-12">
                            <JoditEditor
                                ref={editor}
                                value={blog.content}
                                config={config}
                                onBlur={handleUpdate}
                            />
                            <input type='hidden' value={blog.content} name='content'/>
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

export default AddBlog
