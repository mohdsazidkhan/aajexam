import React,{useState,useEffect} from 'react'
import './contacts.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import axios from 'axios';

function Contacts() {
    
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        getContacts();
    }, [])

    const getContacts = () => {
        axios.get('http://localhost:4000/getcontacts')
            .then(res => {
                if(res){
                    setContacts(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
    if(contacts.length > 0){
    return (
        <div className="admin">
            <Header/>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-2 adminSidebar">
                        <Sidebar/>
                    </div>
                    <div className="col-sm-10 adminContent contacts">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Contacts</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Subject</th>
                                            <th>Message</th>
                                        </thead>
                                        <tbody>
                                        {contacts.map((contact, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{contact.id}</td>
                                                <td>{contact.name}</td>
                                                <td>{contact.email}</td>
                                                <td>{contact.phone}</td>
                                                <td>{contact.subject}</td>
                                                <td>{contact.message}</td>
                                            </tr>
                                        )
                                        })}
                                        </tbody>
                                    </table>
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
                        <div className="col-sm-10 adminContent contacts">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Contacts</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No Contact Found!</h5>
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

export default Contacts
