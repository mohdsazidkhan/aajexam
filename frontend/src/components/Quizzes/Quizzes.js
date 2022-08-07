import React,{useState,useEffect} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import "./quizzes.css";
import axios from 'axios';
import {Link} from 'react-router-dom'

function Quizzes() {

    const [quizzes, setQuizzes] = useState([]);
    const [userRole, setUserRole] = useState('');


    useEffect(() => {
        setUserRole(localStorage.getItem("userRole"));
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

    if(quizzes.length > 0){
        return (
            <div className='AppContainer'>
            <Header/>
                <div className="uiQuizzes">
                    <div className="container">
                        <div className="row">
                        <div className="col-sm-12"><h1>Quizzes</h1></div>
                            {quizzes.map((quiz) => {
                                return(
                                <div className="col-sm-3" key={quiz.id}>
                                    <div className="quizBg">
                                        <h5>{quiz.name}</h5>
                                        <Link className='category' to="/examdetails" state={{id: quiz.categoryID, name: quiz.categoryName}}>
                                            {quiz.categoryName}
                                        </Link>
                                        <p>Questions: {quiz.questions}</p>
                                        <p>Total Time: {quiz.totaltime} Minutes</p>
                                        <Link to={userRole === 'student' ? "/questions" : "/login" } state={{id: quiz.id, name: quiz.name}} className="quizBtn">Start Quiz</Link>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            <Footer/>
            </div>
        )
    }else{
        return(
            <div className='AppContainer'>
            <Header/>
                <div className="coursecarousel">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                            <h1>Practice Quizzes</h1>
                            </div>
                            <div className="col-sm-12">
                            <h5>No Quiz Found!</h5>
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
