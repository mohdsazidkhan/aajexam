import React,{useState,useEffect} from 'react'
import './questions.css'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import axios from 'axios';
import {useLocation } from 'react-router-dom';
import {useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

function Questions() {
    const navigate = useNavigate();

    const location = useLocation()
    const id  = location.state.id;
    const quizname  = location.state.name;
    const totaltime  = location.state.totaltime;

    const userId = localStorage.getItem("userId");

    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(0);

    const RESET_INTERVAL_S = totaltime*60;

    const formatTime = (time) =>
    `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
        time % 60
    ).padStart(2, "0")}`;

    const Timer = ({ time }) => {
    const timeRemain = RESET_INTERVAL_S - (time % RESET_INTERVAL_S);

    return (
        <>
        <div className='quizTime'>{formatTime(timeRemain)}</div>
        </>
    );
    };

    const IntervalTimerFunctional = () => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        const timerId = setInterval(() => {
        setTime((t) => t + 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    return <Timer time={time} />;
    };
    
    useEffect(() => {
        getQuestions();
        return () => {
            setQuestions({}); // This worked for me
        };
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const getQuestions = () => {
        axios.get('http://localhost:4000/getquestions?id='+id)
            .then(res => {
                if(res){
                    setQuestions(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    const finishQuiz = () => {
        if(userId && quizname && id){
            axios.post('http://localhost:4000/addscore', {
                userId,
                score,
                totalQ:questions.length,
                quizname,
                id
            })
            .then(res => {
                if(res){
                    toast(res.data.message);
                    navigate('/profile')
                }
            })
        }else{
            toast("Invalid Input");
        }
    }

    if(questions.length > 0){
    return (
        <div className='AppContainer'>
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
        
        <div className="container">
            <div className="row">
                <div className="uiquestions">
                    <div className="col-sm-12">
                        <h1>{quizname}</h1>
                        <IntervalTimerFunctional />
                    </div>
                    <h3>
                        You scored {score} out of {questions.length}
                    </h3>
                    {questions.map((quest, index) => {
                    return(
                    <div className="col-sm-12" key={quest.id}>
                        <div className='quest'>{index+1+'. '+quest.question}</div>

                        <div className='form-group'>
                            <input type="radio" value={quest.optionA} 
                            onChange=
                            {
                                (event)=> event.target.value === quest.answer 
                            ?
                                setScore(score+1)
                            : 
                                setScore(score)
                            }
                            name={"options"+index}/> 
                            <label>{quest.optionA}</label>
                        </div>
                        <div className='form-group'>
                            <input type="radio" value={quest.optionB} 
                            onChange=
                            {
                                (event)=> event.target.value === quest.answer 
                            ?
                                setScore(score+1)
                            : 
                                setScore(score)
                            }
                            name={"options"+index}/> 
                            <label>{quest.optionB}</label>
                        </div>    
                        <div className='form-group'>
                            <input type="radio" value={quest.optionC} 
                            onChange=
                            {
                                (event)=> event.target.value === quest.answer 
                            ?
                                setScore(score+1)
                            : 
                                setScore(score)
                            }
                            name={"options"+index}/> 
                            <label>{quest.optionC}</label>
                        </div>    
                        <div className='form-group'>
                            <input type="radio" value={quest.optionD} 
                            onChange=
                            {
                                (event)=> event.target.value === quest.answer 
                            ?
                                setScore(score+1)
                            : 
                                setScore(score)
                            }
                            name={"options"+index}/>  
                            <label>{quest.optionD}</label>
                        </div>
                    </div>    
                    )
                    })}
                    <div className="finishbutton" onClick={finishQuiz}>Finish</div>
                    </div>
                </div>
            </div>
        <Footer/>
    </div>
    )}else{
        return (
        <div className='AppContainer'>
            <Header/>
            <div className="uiquestions">
                <div className="container">
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
            <Footer/>
        </div>
        )
    }
}

export default Questions
