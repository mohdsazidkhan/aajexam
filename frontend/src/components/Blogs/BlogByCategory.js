import React,{useState,useEffect} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import "./blogs.css";
import axios from 'axios';
import {Link, useLocation } from 'react-router-dom'


function BlogByCategory() {

    const location = useLocation()
    const id  = location.state.id;
    const name  = location.state.name;

    const [blogs, setBlogs] = useState([]);

    //console.log(blogs);

    useEffect(() => {
        getBlogs();
    }, [])// eslint-disable-line react-hooks/exhaustive-deps

    const getBlogs = () => {
        axios.get('http://localhost:4000/getblogsbycategory?id='+id)
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
    return(
        <div className='AppContainer'>
        <Header/>
        <div className="blogs">
            <div className="container">
                <div className="row">
                <div className="col-sm-12"><h1>Blogs Published in {name}</h1></div>
                        {blogs.map((blog) => {
                            return(
                            <div className="col-sm-3" key={blog.id}>
                                <Link className='post' to="/blogdetails" state={{id: blog.id,name:blog.name}}
                                >
                                    <img src={require('../../../../backend/images/'+blog.photo)} alt={blog.name}/>
                                    <h1>{blog.name}</h1>
                                    <h3><Link to="/blogbycategory" state={{id: blog.categoryID, name: blog.categoryName}}
                                >{blog.categoryName}</Link></h3>
                                </Link>
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
    return (
        <div className='AppContainer'>
        <Header/>
            <div className="blogs">
                <div className="container">
                    <div className="row">
                    <div className="col-sm-12">
                        <h1>Blog</h1>
                        </div>
                        <div className="col-sm-12">
                        <h5>No Post Found!</h5>
                        </div>
                    </div>
                </div>
            </div>
        <Footer/>
        </div>
    )
    } 
}

export default BlogByCategory
