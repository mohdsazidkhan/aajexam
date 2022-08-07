import React,{useState,useEffect} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import "./blogs.css";
import axios from 'axios';
import {Link, useLocation } from 'react-router-dom'


function BlogByAuthor() {

    const location = useLocation()
    const name  = location.state.name;

    const [blogs, setBlogs] = useState([]);

    //console.log(blogs);

    useEffect(() => {
        const getBlogs = () => {
            axios.get('http://localhost:4000/getblogsbyauthor?name='+name)
                .then(res => {
                    if(res){
                        setBlogs(res.data.data);
                    }
                })
                .catch(err => {
                    console.log(err);
            });
        }
        getBlogs();
    }, [name])

    

    if(blogs.length > 0){
    return(
        <div className='AppContainer'>
        <Header/>
        <div className="blogs">
            <div className="container">
                <div className="row">
                <div className="col-sm-12"><h1>Blogs Published By: {name}</h1></div>
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

export default BlogByAuthor
