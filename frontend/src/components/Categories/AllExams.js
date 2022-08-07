import React,{useEffect,useState} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import './allexams.css'
import { useLocation } from 'react-router-dom'
import axios from 'axios';
import {Link} from 'react-router-dom'

function AllExams() {
    const location = useLocation()
    const id  = location.state.id;
    const name  = location.state.name;
    
    const [allExams, setAllExams] = useState([]);
    
    console.log(allExams);

    useEffect(() => {
        getAllExams();
        return () => {
            setAllExams({}); // This worked for me
        };
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const getAllExams = () => {
        axios.get('http://localhost:4000/getallexams?id='+id)
            .then(res => {
                if(res){
                    setAllExams(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }
    if(allExams.length > 0){
    return (
        <div className='AppContainer'>
            <Header/>
                <div className='allExams'>
                    <div className='container'>
                    <div className='row'>
                        
                            <div className="col-sm-12"><h1>{name}</h1></div>
                            {allExams.map((exam) => {
                            return(
                                <div className='col-sm-3' key={exam.id}>
                                    <Link className='exam_bg' to="/examdetails" state={{id: exam.id, name: exam.name}}
                                >{exam.name}</Link>
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
                <div className='container'>
                <div className='row'>
                    <div className='allExams'>
                        <div className="col-sm-12">
                            <h1>{name}</h1>
                        </div>
                        <div className='col-sm-12'>
                            <h5>No Exam Found!</h5>
                        </div>
                    </div>
                </div>
                </div>
            <Footer/>
        </div>
        )
    }
}

export default AllExams
