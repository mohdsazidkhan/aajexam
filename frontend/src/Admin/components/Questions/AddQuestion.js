import React, { useEffect,useState } from "react";
import './addquestion.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';


function AddQuestion() {

    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);

    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [answer, setAnswer] = useState('');
    const [quizName, setQuizName] = useState('');
    const [quizID, setQuizID] = useState('');

    useEffect(() => {
        getQuizzes();
    }, [])

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

    const handleSubmit = (e) => {

        e.preventDefault();

        if(question && option1 && option2 && option3 && option4 && answer && quizName && quizID){
            axios.post('http://localhost:4000/addquestion', {
                question,
                option1,
                option2,
                option3,
                option4,
                answer,
                quizName,
                quizID
        }).then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/allquestions')
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    const handleQuiz = (e) => {
        setQuizName(e.target.selectedOptions[0].text);
        setQuizID(e.target.value);
    }

    const handleQuestion = (e) => {
        setQuestion(e.target.value);
    }

    const handleOption1 = (e) => {
        setOption1(e.target.value);
    }

    const handleOption2 = (e) => {
        setOption2(e.target.value);
    }

    const handleOption3 = (e) => {
        setOption3(e.target.value);
    }

    const handleOption4 = (e) => {
        setOption4(e.target.value);
    }

    const handleAnswer = (e) => {
        setAnswer(e.target.value);
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
                    <div className="col-sm-10  adminContent addQuestion">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Add New Question</h1>
                            </div>
                            
                            <div className="col-sm-12">
                            <form className="row" onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className="col-sm-12">
                                <select value={quizID} className='form-control mb-2' name="quiz" onChange={handleQuiz}>
                                <option value="">Select Quiz Name</option>
                                {quizzes.map((quiz) => {
                                return(
                                    <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
                                    )
                                })}
                                </select>
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Question"
                                    name="question"
                                    className='form-control mb-2'
                                    value={question}
                                    onChange={handleQuestion}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Option 1"
                                    name="option1"
                                    className='form-control mb-2'
                                    value={option1}
                                    onChange={handleOption1}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Option 2"
                                    name="option2"
                                    className='form-control mb-2'
                                    value={option2}
                                    onChange={handleOption2}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Option 3"
                                    name="option3"
                                    className='form-control mb-2'
                                    value={option3}
                                    onChange={handleOption3}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Option 4"
                                    name="option4"
                                    className='form-control mb-2'
                                    value={option4}
                                    onChange={handleOption4}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    type="text"
                                    placeholder="Enter Correct Answer"
                                    name="answer"
                                    className='form-control mb-2'
                                    value={answer}
                                    onChange={handleAnswer}
                                />
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    className='button'
                                    type="submit"
                                    value={'Submit'}
                                />
                            </div>
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

export default AddQuestion
