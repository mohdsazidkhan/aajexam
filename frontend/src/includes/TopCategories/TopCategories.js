
import React,{useState,useEffect} from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination"
import "swiper/css/navigation"
import "./topcategories.css";
import axios from 'axios';
import {Link} from 'react-router-dom';

import SwiperCore, {
    Autoplay,Pagination,Navigation
} from 'swiper';

SwiperCore.use([Autoplay,Pagination,Navigation]);

function TopCategories() {

const [categories, setCategories] = useState([]);
console.log(categories);
const getCategories = ()=>{
    axios.get('http://localhost/aajexam/getcategories.php')
    .then(res => {
        if(res){
            setCategories(res.data.data);
        }
    })
        .catch(err => {
            console.log(err);
    });
}

useEffect(() => {
    getCategories()
    return () => {
        setCategories({}); // This worked for me
    };
}, []) // eslint-disable-line react-hooks/exhaustive-deps



if(categories.length > 0){
return (
    <>
    <div className="categoriescarousel">
        <div className="container">
            <div className="row">
               <div className="col-sm-12"><h1>Exams Categories</h1></div>
                <Swiper 
                autoplay={{
                    "delay": 5000,
                    "disableOnInteraction": false
                }}
                slidesPerView={1} 
                spaceBetween={10} 
                slidesPerGroup={1} 
                loop={false} 
                loopFillGroupWithBlank={false} 
                pagination={{
                "clickable": true
                }} 
                navigation={true} 
                className="categories"
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
                {categories.map((category) => {
                return(
                    <SwiperSlide key={category.id}>
                        <Link to="/allexams" state={{id: category.id,name: category.name}} className="category_bg">{category.name}</Link>
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
                       <h1>Top Categories</h1>
                    </div>
                    <div className="col-sm-12">
                       <h5>No Category Found!</h5>
                    </div>
                </div>
            </div>
        </div>
        </>
      )
  }
}

export default TopCategories;