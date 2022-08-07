import React,{useState,useEffect} from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import axios from 'axios';
import {Link} from 'react-router-dom'
import './exams.css'

function Exams() {
    
    const [exams, setExams] = useState([]);

    useEffect(() => {
        getExams();
    }, [])

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
    <div className='AppContainer'>
    <Header/>
    <div className="uiexams">
        <div className="container">
            <div className="row">
                <div className="col-sm-12"><h1>Exams</h1></div>
                {exams.map((exam) => {
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
    <Footer/>
    </div>
    )
  }      
          
}

export default Exams
