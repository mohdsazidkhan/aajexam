import React,{useState,useEffect} from 'react'
import './admin.css';
import Header from './includes/Header/Header';
import Footer from './includes/Footer/Footer';
import Sidebar from "./includes/Sidebar/Sidebar";
import {MdList,MdPerson,MdArticle,MdSubject, MdCategory } from "react-icons/md";
import axios from 'axios';
import {Link} from 'react-router-dom'

const Admin = () => {

    // const name = localStorage.getItem("userName");
    // const email = localStorage.getItem("userEmail");
    // const phone = localStorage.getItem("userPhone");
    // const role = localStorage.getItem("userRole");

    const [categories, setCategories] = useState([]);
    const [exams, setExams] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [users, setUsers] = useState([]);

    //console.log(questions);

    useEffect(() => {
        getExams();
        getBlogs();
        getQuizzes();
        getCategories();
        getQuestions();
        getUsers();
    }, [])

    const getUsers = () => {
        axios.get('http://localhost:4000/getusers')
            .then(res => {
                if(res){
                    setUsers(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

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

    const getExams = () => {
        axios.get('http://localhost:4000/getexams')
            .then(res => {
                if(res){
                    setExams(res.data.data);
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

    const getQuizzes = () => {
        axios.get('http://localhost:4000/getquizzes')
            .then(res => {
                if(res){
                    setQuizzes(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    const getQuestions = () => {
        axios.get('http://localhost:4000/getallquestions')
            .then(res => {
                if(res){
                    setQuestions(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    return(
        <div className="admin">
            <Header/>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-2 adminSidebar">
                        <Sidebar/>
                    </div>
                    <div className="col-sm-10 adminContent">
                        <div className="row">
                            <div className="col-xl-2 col-md-6 mb-4">
                                <Link className="card-widget h-100" to="/users">
                                    <div className="card-widget-body">
                                        <div className="dot me-3 bg-pink"></div>
                                        <div className="text">
                                        <h6 className="mb-0">Users</h6><span className="text-gray-500">{users.length}</span>
                                        </div>
                                    </div>
                                    <div className="icon text-white bg-pink"><MdPerson/></div>
                                </Link>
                            </div>
                            <div className="col-xl-2 col-md-6 mb-4">
                                <Link className="card-widget h-100" to="/categories">
                                    <div className="card-widget-body">
                                        <div className="dot me-3 bg-blue"></div>
                                        <div className="text">
                                        <h6 className="mb-0">Categories</h6><span className="text-gray-500">{categories.length}</span>
                                        </div>
                                    </div>
                                    <div className="icon text-white bg-blue"><MdCategory/></div>
                                </Link>
                            </div>
                            <div className="col-xl-2 col-md-6 mb-4">
                                <Link className="card-widget h-100" to="/exams">
                                    <div className="card-widget-body">
                                        <div className="dot me-3 bg-green"></div>
                                        <div className="text">
                                        <h6 className="mb-0">Exams</h6><span className="text-gray-500">{exams.length}</span>
                                        </div>
                                    </div>
                                    <div className="icon text-white bg-green"><MdSubject/></div>
                                </Link>
                            </div>
                            <div className="col-xl-2 col-md-6 mb-4">
                                <Link className="card-widget h-100" to="/quizzes">
                                    <div className="card-widget-body">
                                        <div className="dot me-3 bg-red"></div>
                                        <div className="text">
                                        <h6 className="mb-0">Quizzes</h6><span className="text-gray-500">{quizzes.length}</span>
                                        </div>
                                    </div>
                                    <div className="icon text-white bg-red"><MdList/></div>
                                </Link>
                            </div>
                            <div className="col-xl-2 col-md-6 mb-4">
                                <Link className="card-widget h-100" to="/blogs">
                                    <div className="card-widget-body">
                                        <div className="dot me-3 bg-indigo"></div>
                                        <div className="text">
                                        <h6 className="mb-0">Blogs</h6><span className="text-gray-500">{blogs.length}</span>
                                        </div>
                                    </div>
                                    <div className="icon text-white bg-indigo"><MdArticle/></div>
                                </Link>
                            </div>
                            <div className="col-xl-2 col-md-6 mb-4">
                                <Link className="card-widget h-100" to="/allquestions">
                                    <div className="card-widget-body">
                                        <div className="dot me-3 bg-yellow"></div>
                                        <div className="text">
                                        <h6 className="mb-0">Questions</h6><span className="text-gray-500">{questions.length}</span>
                                        </div>
                                    </div>
                                    <div className="icon text-white bg-yellow"><MdList/></div>
                                </Link>
                            </div>
                        </div> 
                    </div>     
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default Admin;