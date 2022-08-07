import React, {useState,useEffect,useRef} from 'react'
import './blogs.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import axios from 'axios';
import JoditEditor from "jodit-react";
import { ToastContainer, toast } from 'react-toastify';

function Blogs() {
    
    const [blogs, setBlogs] = useState([]);
    const author = localStorage.getItem("userName"); 
    const [blogID, setBlogID] = useState();
    const publishedAt = Date().toLocaleString()
    const [categoryName, setCategoryName] = useState('');

    const editor = useRef(null);

    const config = {
        readonly: false,
        height: 400
    };

    const [categories, setCategories] = useState([0]);
    
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
        getBlogs();
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

    const getBlogs = () => {
        axios.get('http://localhost:4000/getblogs')
            .then(res => {
                if(res){
                    setBlogs(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
    const updateBlog = (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('photo', blog.photo);
        formData.append('name', blog.name);
        formData.append('author', author);
        formData.append('publishedAt', publishedAt);
        formData.append('categoryID', blog.categoryID);
        formData.append('categoryName', categoryName);
        formData.append('content', blog.content);

        axios.post('http://localhost:4000/updateblog?id='+blogID, formData).then(res => {
            if(res){
                toast(res.data.message);
                window.location.reload()
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    const deleteBlog = (e) => {
        e.preventDefault();
        axios.delete('http://localhost:4000/deleteblog?id='+blogID).then(res => {
            if(res){
                toast(res.data.message);
                window.location.reload()
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

    const handleName = blog => (e) => {
        setBlogID(blog.id);
        setBlog({...blog, name: blog.name});
        setBlog({...blog, photo: blog.photo});
        setBlog({...blog, content: blog.content});
        setCategoryName(blog.categoryName);
    }

    if(blogs.length > 0){
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
                    <div className="col-sm-10 adminContent blogs">
                    <div className="row">
                            <div className="col-sm-12">
                                <h1>Blogs</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Author</th>
                                            <th>Category</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </thead>
                                        <tbody>
                                        {blogs.map((blog, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{blog.id}</td>
                                                <td>{blog.name}</td>
                                                <td>{blog.author}</td>
                                                <td>{blog.categoryName}</td>
                                                <td> 
                                                    <button type="button" onClick={handleName({
                                                        id: blog.id,
                                                        name: blog.name, 
                                                        author: blog.author, 
                                                        photo: blog.photo, 
                                                        content: blog.content,
                                                        categoryID: blog.categoryID, 
                                                        categoryName: blog.categoryName 
                                                    })} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                                </td>
                                                <td><button type="button" onClick={handleName({name: blog.name, id: blog.id})} className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
                                            </tr>
                                        )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='col-sm-12'>
                            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-xl">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="editModalLabel">Edit Blog</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            
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
                                                    value=""
                                                    className='form-control mb-2'
                                                    onChange={handlePhoto}
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <select value={blog.categoryID} className='form-control' name="category" onChange={handleCategory}>
                                                    <option value="">Select Category</option>
                                                    {categories.map((cat,key) => {
                                                    return(
                                                        <option key={key} value={cat.id}>{cat.name}</option>
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
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={updateBlog} className="btn btn-primary">Save Changes</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="deleteModalLabel">Delete Blog</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <h4>Are you sure to delete this Blog?</h4>
                                                <input type='hidden' value={blogID} name="quizID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={deleteBlog} className="btn btn-primary">Delete</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
            <Footer/>
        </div>
    )
    }else{
        return (
            <div className="admin">
                <Header/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-2 adminSidebar">
                            <Sidebar/>
                        </div>
                        <div className="col-sm-10 adminContent blogs">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Blogs</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No Blog Found!</h5>
                                </div>
                            </div>
                        </div> 
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Blogs
