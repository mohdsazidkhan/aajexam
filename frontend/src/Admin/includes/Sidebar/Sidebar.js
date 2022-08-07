import React  from 'react'
import './sidebar.css'
import {NavLink} from 'react-router-dom';
import { MdPerson,MdDashboard,MdList,MdArticle,MdSubject,MdMail} from "react-icons/md";

function Sidebar() {

    return (
        <div className="sidebar">
            <ul className="nav flex-column">
              <li className="nav-item">
                <NavLink className="nav-link" activeclassname="active" to="/admin">
                    <MdDashboard/>
                    Dashboard
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdSubject/>
                    Categories
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/categories">Categories</NavLink>
                  <NavLink className="dropdown-item" activeclassname="active" to="/addcategory">Add New Category</NavLink>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdSubject/>
                    Exams
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/exams">Exams</NavLink>
                  <NavLink className="dropdown-item" activeclassname="active" to="/addexam">Add New Exam</NavLink>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdList/>
                    Quizzes
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/quizzes">Quizzes</NavLink>
                  <NavLink className="dropdown-item" activeclassname="active" to="/addquiz">Add New Quiz</NavLink>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdSubject/>
                    Questions
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/allquestions">Questions</NavLink>
                  <NavLink className="dropdown-item" activeclassname="active" to="/addquestion">Add New Question</NavLink>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdArticle/>
                    Blogs
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/blogs">Blogs</NavLink>
                  <NavLink className="dropdown-item" activeclassname="active" to="/addblog">Add New Blog</NavLink>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdPerson/>
                    Users
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/users">Users</NavLink>
                  <NavLink className="dropdown-item" activeclassname="active" to="/adduser">Add New User</NavLink>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                    <MdMail/>
                    Contacts
                </div>
                <div className="dropdown-menu show">
                  <NavLink className="dropdown-item" activeclassname="active" to="/contacts">Contacts</NavLink>
                </div>
              </li>
            </ul>
        </div>
    )
}

export default Sidebar
