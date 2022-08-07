import React from 'react'
import {Link} from 'react-router-dom';
import './footer.css'

function Footer() {
    return (
    <footer className="pt-2">
        <div className="px-2">
            <div className="d-md-flex justify-content-between align-items-center py-3 text-center text-md-left">
                <div className="text-primary-hover">Copyrights ©2021 AajExam. All rights reserved. </div>
                <div className=" mt-3 mt-md-0">
                    <ul className="list-inline mb-0">
                        <li className="list-inline-item"><Link className="nav-link" to="/">Terms of Use</Link></li>
                        <li className="list-inline-item"><Link className="nav-link pe-0" to="/">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
    )
}

export default Footer
