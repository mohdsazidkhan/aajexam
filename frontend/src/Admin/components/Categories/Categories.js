import React,{useState,useEffect} from 'react'
import './categories.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function Categories() {

    const [name, setName] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [categories, setCategories] = useState([]);

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

    const updateCategory = (e) => {

        e.preventDefault();

        if(name){
            axios.post('http://localhost:4000/updatecategory?id='+categoryID, {
                name
            }).then(res => {
                if(res){
                    toast(res.data.message);
                    window.location.reload()
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    const deleteCategory = (e) => {

        e.preventDefault();

        if(name){
            axios.delete('http://localhost:4000/deletecategory?id='+categoryID).then(res => {
                if(res){
                    toast(res.data.message);
                    window.location.reload()
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

    const handleName = category => (e) => {
        setName(category.name);
        setCategoryID(category.id);
    }
    
    if(categories.length > 0){
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
                    <div className="col-sm-10 adminContent categories">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Categories</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Category Name</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </thead>
                                        <tbody>
                                        {categories.map((category, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{category.id}</td>
                                                <td>{category.name}</td>
                                                <td> 
                                                    <button type="button" onClick={handleName({name: category.name, id: category.id})} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                                </td>
                                                <td><button type="button" onClick={handleName({name: category.name, id: category.id})} className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
                                            </tr>
                                        )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='col-sm-12'>
                            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="editModalLabel">Edit Category</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <input 
                                                    type="text"
                                                    placeholder="Enter Category Name"
                                                    name="name"
                                                    className='form-control mb-2'
                                                    value={name}
                                                    onChange={handleChange}
                                                />
                                                <input type='hidden' value={categoryID} name="categoryID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={updateCategory} className="btn btn-primary">Save Changes</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="deleteModalLabel">Delete Category</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <h4>Are you sure to delete this category?</h4>
                                                <input type='hidden' value={categoryID} name="categoryID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={deleteCategory} className="btn btn-primary">Delete</button>
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
    )}else{
        return (
            <div className="admin">
                <Header/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-2 adminSidebar">
                            <Sidebar/>
                        </div>
                        <div className="col-sm-10 adminContent categories">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Categories</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No Category Found!</h5>
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

export default Categories
