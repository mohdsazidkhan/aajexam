import React from 'react';
import './header.css';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = () => {
    const loggedIn = localStorage.getItem("loggedIn");
    const name = localStorage.getItem("userName");
    const handleLogout = () => {
        toast("Logout Successfully");
        localStorage.clear();
        navigate('/');
    };
    const navigate = useNavigate();
    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img alt="Logo" src={require('../../assets/aajexam.png')} />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link className="nav-link active" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/categories">Categories</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/exams">Exams</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/quizzes">Quizzes</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/blogs">Blogs</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/about-us">About US</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/contact-us">Contact US</Link>
                    </li>
                </ul>
                <div className="nav my-3 my-xl-0 flex-nowrap align-items-center">
					<div className="nav-item w-100">
						<form className="position-relative">
							<input className="form-control pe-5 bg-transparent" type="search" placeholder="Search"/>
						</form>
					</div>
				</div>
                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                    {loggedIn === "true" ?
                        <Link className="button" to="/profile">{name}</Link>
                        :
                        <Link className="nav-link" to="/register">Register</Link>
                        }
                    </li>
                    <li className="nav-item">
                    {loggedIn === "true" ?
                        <div className="button" onClick={handleLogout}>Logout</div>
                        :
                        <Link className="nav-link" to= '/login'>Login</Link>
                    }
                    </li>
                </ul>
                </div>
            </div>
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
        </nav>
    )
}

export default Header
