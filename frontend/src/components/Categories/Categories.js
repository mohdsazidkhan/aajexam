import React,{useEffect,useState} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import axios from 'axios';
import './categories.css';
import {Link} from 'react-router-dom'

function Categories() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategories();
    }, [])
    
    const getCategories = () => {
        axios.get('http://localhost:4000/getcategories')
            .then(res => {
                if(res){
                    setCategories(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
    if(categories.length > 0){
        return (
        <div className='AppContainer'>
            <Header/> 
                <div className="categories">
                    <div className="container">
                        <div className="row">
                        <div className="col-sm-12"><h1>Exams Categories</h1></div>
                        
                        {categories.map((category) => {
                        return(
                            <div className='col-sm-3' key={category.id}>
                                <Link to="/allexams" state={{id: category.id, name: category.name}} className="category_bg">{category.name}</Link>
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
                    <div className="categoriescarousel">
                        <div className="container">
                            <div className="row">
                            <div className="col-sm-12"><h1>Exams Categories</h1></div>
                                <div className='col-sm-3'>
                                    <h3>No Category Found!</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                <Footer/>
            </div>
            )
    }
}

export default Categories;
