import React,{useState,useEffect} from 'react'
import './questions.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function Questions() {
    
    const [questions, setQuestions] = useState([]);
    const [questionID, setQuestionID] = useState('');
    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [answer, setAnswer] = useState('');
    const [quizName, setQuizName] = useState('');
    const [quizID, setQuizID] = useState('');

    const [quizzes, setQuizzes] = useState([]);

    //console.log(questions);

    useEffect(() => {
        getQuestions();
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
    const updateQuiz = (e) => {
        e.preventDefault();
        axios.post('http://localhost:4000/updatequestion?id='+questionID, {
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
                window.location.reload()
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    const deleteQuiz = (e) => {
        e.preventDefault();
        axios.delete('http://localhost:4000/deletequestion?id='+questionID).then(res => {
            if(res){
                toast(res.data.message);
                window.location.reload()
            }
        })
        .catch(err => {
            console.log(err);
        });
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

    const handleQuiz = (e) => {
        setQuizName(e.target.selectedOptions[0].text);
        setQuizID(e.target.value);
    }

    const handleName = question => (e) => {
        setQuestion(question.question);
        setQuestionID(question.id);
        setOption1(question.optionA);
        setOption2(question.optionB);
        setOption3(question.optionC);
        setOption4(question.optionD);
        setAnswer(question.answer);
        setQuizID(question.quizID);
        setQuizName(question.quizName);
    }
    if(questions.length > 0){
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
                    <div className="col-sm-10 adminContent questions">
                    <div className="row">
                            <div className="col-sm-12">
                                <h1>Questions</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Question</th>
                                            <th>OptionA</th>
                                            <th>OptionB</th>
                                            <th>OptionC</th>
                                            <th>OptionD</th>
                                            <th>Answer</th>
                                            <th>Quiz</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </thead>
                                        <tbody>
                                        {questions.map((question, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{question.id}</td>
                                                <td>{question.question}</td>
                                                <td>{question.optionA}</td>
                                                <td>{question.optionB}</td>
                                                <td>{question.optionC}</td>
                                                <td>{question.optionD}</td>
                                                <td>{question.answer}</td>
                                                <td>{question.quizName}</td>
                                                <td> 
                                                    <button type="button" onClick={handleName({
                                                        id: question.id,
                                                        question: question.question, 
                                                        optionA: question.optionA, 
                                                        optionB: question.optionB, 
                                                        optionC: question.optionC, 
                                                        optionD: question.optionD,
                                                        answer: question.answer,
                                                        quizID: question.quizID,
                                                        quizName: question.quizName
                                                    })} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                                </td>
                                                <td><button type="button" onClick={handleName({
                                                    question: question.question, 
                                                    id: question.id
                                                    })} className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
                                            </tr>
                                        )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='col-sm-12'>
                            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="editModalLabel">Edit Question</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
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
                                        </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={updateQuiz} className="btn btn-primary">Save Changes</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="deleteModalLabel">Delete Question</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <h4>Are you sure to delete this Question?</h4>
                                                <input type='hidden' value={quizID} name="quizID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={deleteQuiz} className="btn btn-primary">Delete</button>
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
                        <div className="col-sm-10 adminContent questions">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Questions</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No Question Found!</h5>
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

export default Questions
