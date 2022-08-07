import React,{useState,useEffect} from 'react'
import './quizzes.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function Quizzes() {

    const [quizzes, setQuizzes] = useState([]);
    const [name, setName] = useState('');
    const [quizID, setQuizID] = useState('');
    const [questions, setQuestions] = useState('');
    const [totaltime, setTotalTime] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [exams, setExams] = useState([]);

    useEffect(() => {
        getQuizzes();
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

    const updateQuiz = (e) => {
        e.preventDefault();
        axios.post('http://localhost:4000/updatequiz?id='+quizID, {
            name, 
            categoryName,
            categoryID,
            questions,
            totaltime
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
        axios.delete('http://localhost:4000/deletequiz?id='+quizID).then(res => {
            if(res){
                toast(res.data.message);
                window.location.reload()
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    const handleQuizName = (e) => {
        setName(e.target.value);
    }

    const handleQuestions = (e) => {
        setQuestions(e.target.value);
    }

    const handleTotalTime = (e) => {
        setTotalTime(e.target.value);
    }

    const handleCategory = (e) => {
        setCategoryName(e.target.selectedOptions[0].text);
        setCategoryID(e.target.value);
    }

    const handleName = quiz => (e) => {
        setName(quiz.name);
        setQuizID(quiz.id);
        setQuestions(quiz.questions);
        setTotalTime(quiz.totaltime);
        setCategoryID(quiz.categoryID);
        setCategoryName(quiz.categoryName);
    }
    
    if(quizzes.length > 0){
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
                    <div className="col-sm-10 adminContent quizzes">
                    <div className="row">
                            <div className="col-sm-12">
                                <h1>Quizzes</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Questions</th>
                                            <th>Total Time</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </thead>
                                        <tbody>
                                        {quizzes.map((quiz, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{quiz.id}</td>
                                                <td>{quiz.name}</td>
                                                <td>{quiz.questions}</td>
                                                <td>{quiz.totaltime}</td>
                                                <td> 
                                                    <button type="button" onClick={handleName({
                                                        name: quiz.name, 
                                                        id: quiz.id, 
                                                        questions: quiz.questions, 
                                                        totaltime: quiz.totaltime, 
                                                        categoryID: quiz.categoryID, 
                                                        categoryName: quiz.categoryName 
                                                    })} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                                </td>
                                                <td><button type="button" onClick={handleName({name: quiz.name, id: quiz.id})} className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
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
                                            <h5 className="modal-title" id="editModalLabel">Edit Quiz</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <input 
                                                    type="text"
                                                    placeholder="Enter Category Name"
                                                    name="name"
                                                    className='form-control mb-2'
                                                    value={name}
                                                    onChange={handleQuizName}
                                                />
                                            </div>
                                            <div className="col-sm-12">
                                                <input 
                                                    type="text"
                                                    placeholder="Enter Questions"
                                                    name="questions"
                                                    className='form-control mb-2'
                                                    value={questions}
                                                    onChange={handleQuestions}
                                                />
                                            </div>
                                            <div className="col-sm-12">
                                                <input 
                                                    type="text"
                                                    placeholder="Enter Total Time"
                                                    name="totaltime"
                                                    className='form-control mb-2'
                                                    value={totaltime}
                                                    onChange={handleTotalTime}
                                                />
                                            </div>
                                            <div className="col-sm-12">
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
                                            <input type='hidden' value={quizID} name="quizID"/>
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
                                            <h5 className="modal-title" id="deleteModalLabel">Delete Quiz</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <h4>Are you sure to delete this Quiz?</h4>
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
    )
    }else{
        return (
            <div className="admin">
            <Header/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-2 adminSidebar">
                            <Sidebar/>
                        </div>
                        <div className="col-sm-10 adminContent quizzes">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Quizzes</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No Quiz Found!</h5>
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

export default Quizzes
