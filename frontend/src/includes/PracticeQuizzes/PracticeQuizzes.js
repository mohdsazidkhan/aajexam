
import React,{useState,useEffect} from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination"
import "swiper/css/navigation"
import "./practicequizzes.css";
import axios from 'axios';
import {Link} from 'react-router-dom'

import SwiperCore, {
    Autoplay,Pagination,Navigation
} from 'swiper';

SwiperCore.use([Autoplay,Pagination,Navigation]);

function PracticeQuizzes() {
    
    const [quizzes, setQuizzes] = useState([]);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        getQuizzes();
        setUserRole(localStorage.getItem("userRole"));
        return () => {
            setQuizzes({}); // This worked for me
        };
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
    <>
    <div className="quizzescarousel">
        <div className="container">
            <div className="row">
               <div className="col-sm-12"><h1>Practice Quizzes</h1></div>
                <Swiper 
                autoplay={{
                    "delay": 5000,
                    "disableOnInteraction": false
                }}
                slidesPerView={1} 
                spaceBetween={10} 
                slidesPerGroup={4} 
                loop={false} 
                loopFillGroupWithBlank={false} 
                pagination={{
                "clickable": true
                }} 
                navigation={true} 
                className="practiceQuizzes"
                breakpoints={{
                    "640": {
                      "slidesPerView": 2,
                      "spaceBetween": 20
                    },
                    "768": {
                      "slidesPerView": 3,
                      "spaceBetween": 40
                    },
                    "1024": {
                      "slidesPerView": 4,
                      "spaceBetween": 50
                    }
                }}
                >
                    {quizzes.map((quiz) => {
                        return(
                        <SwiperSlide key={quiz.id}>
                            <div className="quizBg">
                                <h5>{quiz.name}</h5>
                                <Link className='category' to="/examdetails" state={{id: quiz.categoryID, name: quiz.categoryName}}>
                                    {quiz.categoryName}
                                </Link>
                                <p>Questions: {quiz.questions}</p>
                                <p>Total Time: {quiz.totaltime} Minutes</p>
                                <Link to={userRole === 'student' ? "/questions" : "/login" } state={{id: quiz.id, name: quiz.name}} className="quizBtn">Start Quiz</Link>
                            </div>
                        </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>
        </div>
    </div>
    </>
  )
  }else{
    return (
        <>
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
        </>
      )
  }
}

export default PracticeQuizzes;