import React,{useEffect,useState} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import './examdetails.css'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios';

function ExamDetails() {

    const location = useLocation()
    const id  = location.state.id;
    const name  = location.state.name;
    
    const [examDetail, setExamDetail] = useState([]);
    const [examQuizzes, setExamQuizzes] = useState([]);
    const [userRole, setUserRole] = useState('');

    //console.log(examQuizzes);

    useEffect(() => {
        setUserRole(localStorage.getItem("userRole"));
        getExamDetail();
        getExamQuizzes();
        return () => {
            setExamDetail({});
            setExamQuizzes({});
        };
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const getExamDetail = () => {
        axios.get('http://localhost:4000/getexamdetails?id='+id)
            .then(res => {
                if(res){
                    setExamDetail(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    const getExamQuizzes = () => {
        axios.get('http://localhost:4000/getexamquizzes?id='+id)
            .then(res => {
                if(res){
                    setExamQuizzes(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
 
    if(examDetail.length > 0){
    return (
        <div className='AppContainer'>
            <Header/>
                <div className='container'>
                <div className='row'>
                    <div className='col-sm-9'>
                        <div className="examContent">
                            <ul className="nav nav-pills mt-3 mb-3" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="pills-overview-tab" data-bs-toggle="pill" data-bs-target="#pills-overview" type="button" role="tab" aria-controls="pills-overview" aria-selected="true">Overview</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-vacancies-tab" data-bs-toggle="pill" data-bs-target="#pills-vacancies" type="button" role="tab" aria-controls="pills-vacancies" aria-selected="false">Vacancies</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-applyonline-tab" data-bs-toggle="pill" data-bs-target="#pills-applyonline" type="button" role="tab" aria-controls="pills-applyonline" aria-selected="false">Apply Online</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-eligibility-tab" data-bs-toggle="pill" data-bs-target="#pills-eligibility" type="button" role="tab" aria-controls="pills-eligibility" aria-selected="false">Eligibility</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-admitcard-tab" data-bs-toggle="pill" data-bs-target="#pills-admitcard" type="button" role="tab" aria-controls="pills-admitcard" aria-selected="false">Admit Card</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-exampattern-tab" data-bs-toggle="pill" data-bs-target="#pills-exampattern" type="button" role="tab" aria-controls="pills-exampattern" aria-selected="false">Exam Pattern</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-syllabus-tab" data-bs-toggle="pill" data-bs-target="#pills-syllabus" type="button" role="tab" aria-controls="pills-syllabus" aria-selected="false">Syllabus</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-cutoff-tab" data-bs-toggle="pill" data-bs-target="#pills-cutoff" type="button" role="tab" aria-controls="pills-cutoff" aria-selected="false">Cut off</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-books-tab" data-bs-toggle="pill" data-bs-target="#pills-books" type="button" role="tab" aria-controls="pills-books" aria-selected="false">Books</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-applicationstatus-tab" data-bs-toggle="pill" data-bs-target="#pills-applicationstatus" type="button" role="tab" aria-controls="pills-applicationstatus" aria-selected="false">Application Status</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-previousyearpapers-tab" data-bs-toggle="pill" data-bs-target="#pills-previousyearpapers" type="button" role="tab" aria-controls="pills-previousyearpapers" aria-selected="false">Previous Year Papers</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-salaryandjobprofile-tab" data-bs-toggle="pill" data-bs-target="#pills-salaryandjobprofile" type="button" role="tab" aria-controls="pills-salaryandjobprofile" aria-selected="false">Salary & Job Profile</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-examanalysis-tab" data-bs-toggle="pill" data-bs-target="#pills-examanalysis" type="button" role="tab" aria-controls="pills-examanalysis" aria-selected="false">Exam Analysis</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-answerkey-tab" data-bs-toggle="pill" data-bs-target="#pills-answerkey" type="button" role="tab" aria-controls="pills-answerkey" aria-selected="false">Answer Key</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-result-tab" data-bs-toggle="pill" data-bs-target="#pills-result" type="button" role="tab" aria-controls="pills-result" aria-selected="false">Result</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-physicalendurancetest-tab" data-bs-toggle="pill" data-bs-target="#pills-physicalendurancetest" type="button" role="tab" aria-controls="pills-physicalendurancetest" aria-selected="false">Physical Endurance Test</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-importantquestions-tab" data-bs-toggle="pill" data-bs-target="#pills-importantquestions" type="button" role="tab" aria-controls="pills-importantquestions" aria-selected="false">Important Questions</button>
                                </li>
                            </ul>
                            <div className="tab-content" id="pills-tabContent">
                                <div className="tab-pane fade active show" id="pills-overview" role="tabpanel" aria-labelledby="pills-overview-tab">
                                    <div className='examDetail'>
                                        <h1>{name}</h1>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].overview}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-vacancies" role="tabpanel" aria-labelledby="pills-vacancies-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Vacancies</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].vacancies}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-applyonline" role="tabpanel" aria-labelledby="pills-applyonline-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Apply Online</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].applyonline}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-eligibility" role="tabpanel" aria-labelledby="pills-eligibility-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Eligibility</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].eligibility}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-admitcard" role="tabpanel" aria-labelledby="pills-admitcard-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Admit Card</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].admitcard}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-exampattern" role="tabpanel" aria-labelledby="pills-exampattern-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Exam Pattern</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].exampattern}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-syllabus" role="tabpanel" aria-labelledby="pills-syllabus-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Syllabus</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].syllabus}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-cutoff" role="tabpanel" aria-labelledby="pills-cutoff-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Cut Off</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].cutoff}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-books" role="tabpanel" aria-labelledby="pills-books-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Books</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].books}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-applicationstatus" role="tabpanel" aria-labelledby="pills-applicationstatus-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Application Status</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].applicationstatus}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-previousyearpapers" role="tabpanel" aria-labelledby="pills-previousyearpapers-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Previous Year Papers</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].previousyearpapers}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-salaryandjobprofile" role="tabpanel" aria-labelledby="pills-salaryandjobprofile-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Salary & Job Profile</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].salaryandjobprofile}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-examanalysis" role="tabpanel" aria-labelledby="pills-examanalysis-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Exam Analysis</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].examanalysis}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-answerkey" role="tabpanel" aria-labelledby="pills-answerkey-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Answer Key</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].answerkey}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-result" role="tabpanel" aria-labelledby="pills-result-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Result</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].result}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-physicalendurancetest" role="tabpanel" aria-labelledby="pills-physicalendurancetest-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Physical Endurance Test</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].physicalendurancetest}} />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-importantquestions" role="tabpanel" aria-labelledby="pills-importantquestions-tab">
                                    <div className='examDetail'>
                                        <h2>{name} Important Questions</h2>
                                        <div className='content' dangerouslySetInnerHTML={{__html: examDetail[0].importantquestions}} />
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className="quizSection">
                            <div className="row">
                                <h2>{name} Latest Quizzes</h2>
                                {examQuizzes.map((quiz) => {
                                    return(
                                    <div className="col-sm-4" key={quiz.id}>
                                        <div className="quizBg">
                                            <h5>{quiz.name}</h5>
                                            <p>{quiz.categoryName}</p>
                                            <p>Questions: {quiz.questions}</p>
                                            <p>Total Time: {quiz.totaltime} Minutes</p>
                                            <Link to={userRole === 'student' ? "/questions" : "/login" } state={{id: quiz.id, name: quiz.name, totaltime: quiz.totaltime}} className="quizBtn">Start Quiz</Link>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <div className='importantLinks'>
                            <h3>Important Links</h3>
                            <Link className='updatesLink' to='/categories'>Categories</Link>
                            <Link className='updatesLink' to='/exams'>Exams</Link>
                            <Link className='updatesLink' to='/quizzes'>Quizzes</Link>
                            <Link className='updatesLink' to='/blogs'>Articles</Link>
                            <Link className='updatesLink' to='/about-us'>About US</Link>
                            <Link className='updatesLink' to='/contact-us'>Contact US</Link>
                            <Link className='updatesLink' to='/login'>Login</Link>
                            <Link className='updatesLink' to='/register'>Register</Link>
                        </div>
                    </div>
                </div>
                </div>
            <Footer/>
        </div>
    )
    }else{
        return (
        <div className='AppContainer'>
            <Header/>
                <div className='container'>
                <div className='row'>
                    <div className='col-sm-12'>
                        <div className='examDetail'>
                            <h1>{name}</h1>
                            <h5>Nothing Found!</h5>
                        </div>
                    </div>
                </div>
                </div>
            <Footer/>
        </div>
        )
    }
}

export default ExamDetails
