
import React,{useState,useEffect} from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination"
import "swiper/css/navigation"
import "./populararticles.css";
import axios from 'axios';
import {Link} from 'react-router-dom';

import SwiperCore, {
    Autoplay,Pagination,Navigation
} from 'swiper';

SwiperCore.use([Autoplay,Pagination,Navigation]);

function PopularArticles() {

    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        getBlogs();
        return () => {
            setBlogs({}); // This worked for me
        };
    }, [])

    const getBlogs = () => {
        axios.get('http://localhost:4000/getblogs')
            .then(res => {
                if(res){
                    setBlogs(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
if(blogs.length > 0){
return (
    <>
    <div className="articlescarousel">
        <div className="container">
            <div className="row">
               <div className="col-sm-12"><h1>Popular Articles</h1></div>
                <Swiper 
                autoplay={{
                    "delay": 5000,
                    "disableOnInteraction": false
                }}
                slidesPerView={1} 
                spaceBetween={20} 
                slidesPerGroup={1} 
                loop={false} 
                loopFillGroupWithBlank={false} 
                pagination={{
                "clickable": true
                }} 
                navigation={true} 
                className="popularArticles"
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
                    {blogs.map((blog) => {
                        return(
                        <SwiperSlide key={blog.id}>
                            <Link className='blog' to="/blogdetails" state={{id: blog.id,name:blog.name}}
                            >
                                <img src={require('../../../../backend/images/'+blog.photo)} alt={blog.name}/>
                                <h1>{blog.name}</h1>
                                <h3><Link to="/blogbycategory" state={{id: blog.categoryID, name: blog.categoryName}}
                                >{blog.categoryName}</Link></h3>
                            </Link>
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
    return (<>
    <div className="coursecarousel">
        <div className="container">
            <div className="row">
               <div className="col-sm-12">
                   <h1>Popular Articles</h1>
                </div>
                <div className="col-sm-12">
                   <h5>No Article Found!</h5>
                </div>
            </div>
        </div>
    </div>
    </>
    )
}
}

export default PopularArticles;