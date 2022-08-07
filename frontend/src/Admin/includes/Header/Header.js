import React from 'react';
import './header.css';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = () => {

    const loggedIn = localStorage.getItem("loggedIn");
    const name = localStorage.getItem("userName");

    const handleLogout = () => {
        toast("Logout Successfully");
        localStorage.clear();
        window.location.href = "/";
    };

    return(
        <nav className="navbar navbar-expand-lg shadow-sm navbar-light bg-light">
                <Link className="navbar-brand" to="/admin">
                    <img alt="Logo" src={require('../../../assets/aajexam.png')} />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
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
