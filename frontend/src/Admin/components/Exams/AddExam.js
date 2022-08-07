import React, { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import './addexam.css'
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';

function AddExam() {

    const editor = useRef(null);

    const config = {
        readonly: false,
        height: 500,
    };

    useEffect(() => {
        getCategories();
    }, [])

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoryID, setCategoryID] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [overview, setOverview] = useState('');
    const [vacancies, setVacancies] = useState('');
    const [applyonline, setApplyOnline] = useState('');
    const [eligibility, setEligibility] = useState('');
    const [admitcard, setAdmitCard] = useState('');
    const [exampattern, setExamPattern] = useState('');
    const [syllabus, setSyllabus] = useState('');
    const [cutoff, setCutOff] = useState('');
    const [books, setBooks] = useState('');
    const [applicationstatus, setApplicationStatus] = useState('');
    const [previousyearpapers, setPreviousYearPapers] = useState('');
    const [salaryandjobprofile, setSalaryAndJobProfile] = useState('');
    const [examanalysis, setExamAnalysis] = useState('');
    const [answerkey, setAnswerKey] = useState('');
    const [result, setResult] = useState('');
    const [importantquestions, setImportantQuestions] = useState('');
    const [physicalendurancetest, setPhysicalEnduranceTest] = useState('');

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

    const handleSubmit = (e) => {

        e.preventDefault();

        axios.post('http://localhost:4000/addexam', {
            name , 
            categoryName,
            categoryID,
            overview,
            vacancies,
            applyonline,
            eligibility,
            admitcard,
            exampattern,
            syllabus,
            cutoff,
            books,
            applicationstatus,
            previousyearpapers,
            salaryandjobprofile,
            examanalysis,
            answerkey,
            result,
            importantquestions,
            physicalendurancetest
        }).then(res => {
            if(res){
                toast(res.data.message);
                navigate('/exams')
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
    const handleChange = (e) => {
        setName(e.target.value);
    }
    const handleCategory = (e) =>{
        setCategoryName(e.target.selectedOptions[0].text);
        setCategoryID(e.target.value);
    }
    const handleOverview = (e) => {
        setOverview(e);
    }
    const handleVacancies = (e) => {
        setVacancies(e);
    }
    const handleApplyOnline = (e) => {
        setApplyOnline(e);
    }
    const handleEligibility = (e) => {
        setEligibility(e);
    }
    const handleAdmitCard = (e) => {
        setAdmitCard(e);
    }
    const handleExamPattern = (e) => {
        setExamPattern(e);
    }
    const handleSyllabus = (e) => {
        setSyllabus(e);
    }
    const handleCutOff = (e) => {
        setCutOff(e);
    }
    const handleBooks = (e) => {
        setBooks(e);
    }
    const handleApplicationStatus = (e) => {
        setApplicationStatus(e);
    }
    const handlePreviousYearPapers = (e) => {
        setPreviousYearPapers(e);
    }
    const handleSalaryAndJobProfile = (e) => {
        setSalaryAndJobProfile(e);
    }
    const handleExamAnalysis = (e) => {
        setExamAnalysis(e);
    }
    const handleAnswerKey = (e) => {
        setAnswerKey(e);
    }
    const handleResult = (e) => {
        setResult(e);
    }
    const handleImportantQuestions = (e) => {
        setImportantQuestions(e);
    }
    const handlePhysicalEnduranceTest = (e) => {
        setPhysicalEnduranceTest(e);
    }
    return (
        <div className="admin">
            <Header/>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-2 adminSidebar">
                        <Sidebar/>
                    </div>
                    <div className="col-sm-10  adminContent addExam">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>Add Exam</h1>
                            </div>
                            <div className="col-sm-12">
                            <form className="row" onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className="col-sm-6">
                                <input 
                                    type="text"
                                    placeholder="Enter Exam Name"
                                    name="name"
                                    className='form-control mb-2'
                                    value={name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-sm-6">
                                <select value={categoryID} className='form-control' name="category" onChange={handleCategory}>
                                <option value="">Select Category</option>
                                {categories.map((cat) => {
                                return(
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    )
                                })}
                                </select>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Overview</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={overview}
                                    config={config}
                                    onBlur={handleOverview}
                                />
                                <input type='hidden' value={overview} name='overview'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Vacancies</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={vacancies}
                                    config={config}
                                    onBlur={handleVacancies}
                                />
                                <input type='hidden' value={vacancies} name='vacancies'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Apply Online</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={applyonline}
                                    config={config}
                                    onBlur={handleApplyOnline}
                                />
                                <input type='hidden' value={applyonline} name='applyonline'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Eligibility</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={eligibility}
                                    config={config}
                                    onBlur={handleEligibility}
                                />
                                <input type='hidden' value={eligibility} name='eligibility'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Admit Card</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={admitcard}
                                    config={config}
                                    onBlur={handleAdmitCard}
                                />
                                <input type='hidden' value={admitcard} name='admitcard'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Exam Pattern</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={exampattern}
                                    config={config}
                                    onBlur={handleExamPattern}
                                />
                                <input type='hidden' value={exampattern} name='exampattern'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Syllabus</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={syllabus}
                                    config={config}
                                    onBlur={handleSyllabus}
                                />
                                <input type='hidden' value={syllabus} name='syllabus'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Cut Off</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={cutoff}
                                    config={config}
                                    onBlur={handleCutOff}
                                />
                                <input type='hidden' value={cutoff} name='cutoff'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Books</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={books}
                                    config={config}
                                    onBlur={handleBooks}
                                />
                                <input type='hidden' value={books} name='books'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Application Status</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={applicationstatus}
                                    config={config}
                                    onBlur={handleApplicationStatus}
                                />
                                <input type='hidden' value={applicationstatus} name='applicationstatus'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Previous Year Papers</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={previousyearpapers}
                                    config={config}
                                    onBlur={handlePreviousYearPapers}
                                />
                                <input type='hidden' value={previousyearpapers} name='previousyearpapers'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Salary & Job Profile</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={salaryandjobprofile}
                                    config={config}
                                    onBlur={handleSalaryAndJobProfile}
                                />
                                <input type='hidden' value={salaryandjobprofile} name='salaryandjobprofile'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Exam Analysis</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={examanalysis}
                                    config={config}
                                    onBlur={handleExamAnalysis}
                                />
                                <input type='hidden' value={examanalysis} name='examanalysis'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Answer Key</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={answerkey}
                                    config={config}
                                    onBlur={handleAnswerKey}
                                />
                                <input type='hidden' value={answerkey} name='answerkey'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Result</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={result}
                                    config={config}
                                    onBlur={handleResult}
                                />
                                <input type='hidden' value={result} name='result'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Important Questions</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={importantquestions}
                                    config={config}
                                    onBlur={handleImportantQuestions}
                                />
                                <input type='hidden' value={importantquestions} name='importantquestions'/>
                            </div>
                            <div className="col-sm-12">
                                <label>Enter Physical Endurance Test</label>
                            </div>
                            <div className="col-sm-12"> 
                                <JoditEditor
                                    ref={editor}
                                    value={physicalendurancetest}
                                    config={config}
                                    onBlur={handlePhysicalEnduranceTest}
                                />
                                <input type='hidden' value={physicalendurancetest} name='physicalendurancetest'/>
                            </div>
                            <div className="col-sm-12">
                                <input 
                                    className='button'
                                    type="submit"
                                    value={'Submit'}
                                />
                            </div>    
                            </form>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default AddExam
