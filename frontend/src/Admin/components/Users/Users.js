import React,{useState,useEffect} from 'react'
import './users.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import validator from 'validator'

function Users() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [cPassword, setCPassword] = useState('')
    const [role, setRole] = useState('')
    const [userID, setUserID] = useState('');
    const [emailError, setEmailError] = useState('')
    const [phoneError, setPhoneError] = useState('')

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

    useEffect(() => {
        getUsers();
    }, [])

    const getUsers = () => {
        axios.get('http://localhost:4000/getUsers')
            .then(res => {
                if(res){
                    setUsers(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
    const updateUser = (e) => {

        e.preventDefault();

        if(name){
            axios.post('http://localhost:4000/updateuser?id='+userID, {
                name,email,phone,password,role
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

    const deleteUser = (e) => {

        e.preventDefault();

        if(name){
            axios.delete('http://localhost:4000/deleteuser?id='+userID).then(res => {
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

    const handleChange = e => {
        if(e.target.name === 'name'){
            setName(e.target.value);
        }else if(e.target.name === 'email'){
            setEmail(e.target.value);
        }else if(e.target.name === 'phone'){
            setPhone(e.target.value);
        }else if(e.target.name === 'password'){
            setPassword(e.target.value);
        }else if(e.target.name === 'confirmPassword'){
            setCPassword(e.target.value);
        }
    }

    const handleName = user => (e) => {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone);
        setPassword(user.password);
        setCPassword(user.cPassword);
        setRole(user.role);
        setUserID(user.id);
    }
    if(users.length > 0){
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
                    <div className="col-sm-10 adminContent users">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Users</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </thead>
                                        <tbody>
                                        {users.map((user, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{user.id}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td> 
                                                    <button type="button" onClick={handleName(
                                                        {
                                                            name: user.name, 
                                                            email: user.email,
                                                            phone: user.phone,
                                                            password: user.password,
                                                            cPassword: user.password,
                                                            role: user.role,
                                                            id: user.id
                                                        }
                                                        )} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                                </td>
                                                <td><button type="button" onClick={handleName({name: user.name, id: user.id})} className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
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
                                            <h5 className="modal-title" id="editModalLabel">Edit User</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                            <input type="text" name="name" value={name} onChange={handleChange} placeholder="Enter Your Name" required/>
                                            <input type="email" name="email" value={email} onKeyUp={validateEmail} onChange={handleChange} placeholder="Enter Your Email" required/>
                                            <div style={{fontWeight: 'bold',color: 'red',}}>{emailError}</div>
                                            <input type="tel" name="phone" value={phone} onKeyUp={validatePhone} onChange={handleChange} placeholder="Enter Your Phone No." required/>
                                            <div style={{fontWeight: 'bold',color: 'red',}}>{phoneError}</div>
                                            <input type="text" name="password" value={password} onChange={handleChange} placeholder="Enter Password" required/>
                                            <input type="text" name="confirmPassword" value={cPassword} onChange={handleChange} placeholder="Confrim Password" required/>
                                                <input type='hidden' value={userID} name="userID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={updateUser} className="btn btn-primary">Save Changes</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="deleteModalLabel">Delete User</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <h4>Are you sure to delete this user?</h4>
                                                <input type='hidden' value={userID} name="userID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={deleteUser} className="btn btn-primary">Delete</button>
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
                        <div className="col-sm-10 adminContent users">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Users</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No User Found!</h5>
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

export default Users
