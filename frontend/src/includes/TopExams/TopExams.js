
import React,{useState,useEffect} from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination"
import "swiper/css/navigation"
import "./topexams.css";
import axios from 'axios';
import {Link} from 'react-router-dom'

import SwiperCore, {
    Autoplay,Pagination,Navigation
} from 'swiper';

SwiperCore.use([Autoplay,Pagination,Navigation]);

function TopExams() {

const [exams, setExams] = useState([]);

useEffect(() => {
    getExams();
    return () => {
        setExams({}); // This worked for me
    };
}, []) // eslint-disable-line react-hooks/exhaustive-deps

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
if(exams.length > 0){
return (
    <>
    <div className="examcarousel">
        <div className="container">
            <div className="row">
               <div className="col-sm-12"><h1>Top Exams</h1></div>
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
                className="exams"
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
                {exams.map((exam) => {
                return(
                    <SwiperSlide key={exam.id}>
                        <Link className='exam_bg' to="/examdetails" state={{id: exam.id,name: exam.name}}
                            >{exam.name}</Link>
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
        <div className="examcarousel">
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                       <h1>Top Exams</h1>
                    </div>
                    <div className="col-sm-12">
                       <h5>No Exam Found!</h5>
                    </div>
                </div>
            </div>
        </div>
        </>
      )
  }
}

export default TopExams;