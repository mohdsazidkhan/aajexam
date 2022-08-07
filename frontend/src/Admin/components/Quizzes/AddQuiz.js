import React, {useEffect,useState}  from 'react'
import './addquiz.css'
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';

function AddQuiz() {

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [questions, setQuestions] = useState('');
    const [totaltime, setTotalTime] = useState('');
    const [exams, setExams] = useState([]);

    const [categoryName, setCategoryName] = useState('');
    const [categoryID, setCategoryID] = useState('');

    //console.log(category);
    
    useEffect(() => {
        getExams();
    }, [])

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

    const handleSubmit = (e) => {

        e.preventDefault();

        axios.post('http://localhost:4000/addquiz', {
            name, 
            categoryName ,
            categoryID,
            questions,
            totaltime
        }).then(res => {
            if(res){
                toast(res.data.message);
                navigate('/quizzes')
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
    const handleCategory = (e) => {
        setCategoryName(e.target.selectedOptions[0].text);
        setCategoryID(e.target.value);
    }

    const handleName = (e) => {
        setName(e.target.value);
    }

    const handleQuestions = (e) => {
        setQuestions(e.target.value);
    }

    const handleTotalTime = (e) => {
        setTotalTime(e.target.value);
    }
    
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
                    <div className="col-sm-10  adminContent addQuiz">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Add Quiz</h1>
                            </div>
                            <div className="col-sm-12">
                            <form className="row" onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className="col-sm-6">
                                <label>Enter Quiz Name</label>
                                <input 
                                    type="text"
                                    name="name"
                                    className='form-control mb-2'
                                    value={name}
                                    onChange={handleName}
                                />
                            </div>
                            <div className="col-sm-6">
                                <label>Enter Questions</label>
                                <input 
                                    type="text"
                                    name="questions"
                                    className='form-control mb-2'
                                    value={questions}
                                    onChange={handleQuestions}
                                />
                            </div>
                            <div className="col-sm-6">
                                <label>Enter Total Time</label>
                                <input 
                                    type="text"
                                    name="totaltime"
                                    className='form-control mb-2'
                                    value={totaltime}
                                    onChange={handleTotalTime}
                                />
                            </div>
                            <div className="col-sm-6">
                                <label>Select Exam Name</label>
                                <select value={categoryID} className='form-control' name="category" onChange={handleCategory}>
                                <option value="">Select Exam</option>
                                {exams.map((exam) => {
                                return(
                                    <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    )
                                })}
                                </select>
                            </div>
                            <input 
                                className='button'
                                type="submit"
                                value={'Submit'}
                            />
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

export default AddQuiz
