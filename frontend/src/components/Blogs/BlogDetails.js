import React,{useEffect,useState} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import './blogdetails.css'
import {Link, useLocation } from 'react-router-dom'
import axios from 'axios';
import moment from 'moment'


function BlogDetails() {

    const location = useLocation()
    const id  = location.state.id;
    const name  = location.state.name;
    
    const [blogDetail, setBlogDetail] = useState([]);
    
    //console.log(blogDetail);

    const getBlogDetail = () => {
        axios.get('http://localhost:4000/getblogdetails?id='+id)
            .then(res => {
                if(res){
                    setBlogDetail(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    useEffect(() => {
        getBlogDetail();
    },[])// eslint-disable-line react-hooks/exhaustive-deps

    
 if(blogDetail.length > 0){
    return (
        <div className='AppContainer'>
            <Header/>
                <div className='container'>
                <div className='row'>
                    <div className='col-sm-9'>
                        <div className="blogDetail">
                            <h1>{name}</h1>
                            <p>Published By: <span className='author'><Link to="/blogbyauthor" state={{name: blogDetail[0].author}}>{blogDetail[0].author}</Link></span> at <span className='date'>{moment(blogDetail[0].publishedAt).format('DD-MMM-YYYY')}</span> in <span className='categoryName'>
                                <Link to="/blogbycategory" state={{id: blogDetail[0].categoryID, name: blogDetail[0].categoryName}}>{blogDetail[0].categoryName}</Link>
                                </span></p>
                            <img className='blogImg'  src={blogDetail[0].photo ? require('../../../../backend/images/'+blogDetail[0].photo) : null} alt={blogDetail[0].name}/>
                            <div className='content' dangerouslySetInnerHTML={{__html: blogDetail[0].content}} />
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
                        <div className='col-sm-9'>
                            <div className="blogDetail">
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

export default BlogDetails
