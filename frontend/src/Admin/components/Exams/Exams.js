import React,{useState,useEffect,useRef} from 'react'
import './exams.css'
import Header from '../../includes/Header/Header';
import Sidebar from '../../includes/Sidebar/Sidebar';
import Footer from '../../includes/Footer/Footer';
import JoditEditor from "jodit-react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function Exams() {

    const [exams, setExams] = useState([]);
    const [examID, setExamID] = useState('');
    const editor = useRef(null);

    const config = {
        readonly: false,
        height: 500,
    };

    useEffect(() => {
        getCategories();
    }, [])

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

    useEffect(() => {
        getExams();
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

    const updateExam = (e) => {

        e.preventDefault();

        axios.post('http://localhost:4000/updateexam?id='+examID, {
            name, 
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
                //window.location.reload()
            }
        })
        .catch(err => {
            console.log(err);
        });
        
    }

    const deleteExam = (e) => {

        e.preventDefault();
     
        axios.delete('http://localhost:4000/deleteexam?id='+examID).then(res => {
            if(res){
                toast(res.data.message);
                window.location.reload()
            }
        })
        .catch(err => {
            console.log(err);
        });
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
    const handleChange = (e) => {
        setName(e.target.value);
    }
    const handleExam = exam => (e) => {
        console.log(exam)
        setExamID(exam.id);
        setName(exam.name);
        setCategoryID(exam.categoryID);
        setCategoryName(exam.categoryName);
        setOverview(exam.overview);
        setVacancies(exam.vacancies);
        setApplyOnline(exam.applyonline);
        setEligibility(exam.eligibility);
        setAdmitCard(exam.admitcard);
        setExamPattern(exam.exampattern);
        setSyllabus(exam.syllabus);
        setCutOff(exam.cutoff);
        setBooks(exam.books);
        setApplicationStatus(exam.applicationstatus);
        setPreviousYearPapers(exam.previousyearpapers);
        setSalaryAndJobProfile(exam.salaryandjobprofile);
        setExamAnalysis(exam.examanalysis);
        setAnswerKey(exam.answerkey);
        setResult(exam.result);
        setImportantQuestions(exam.importantquestions);
        setPhysicalEnduranceTest(exam.physicalendurancetest);
    }

    if(exams.length > 0){
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
                    <div className="col-sm-10 adminContent exams">
                    <div className="row">
                            <div className="col-sm-12">
                                <h1>Exams</h1>
                            </div>
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="adminTable">
                                        <thead>
                                            <th>#</th>
                                            <th>Exam Name</th>
                                            <th>Category Name</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </thead>
                                        <tbody>
                                        {exams.map((exam, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{exam.id}</td>
                                                <td>{exam.name}</td>
                                                <td>{exam.categoryName}</td>
                                                <td> 
                                                    <button type="button" onClick={handleExam({
                                                        name: exam.name, 
                                                        id: exam.id,
                                                        categoryName: exam.categoryName,
                                                        categoryID: exam.categoryID,
                                                        overview: exam.overview,
                                                        vacancies: exam.vacancies,
                                                        applyonline: exam.applyonline,
                                                        eligibility: exam.eligibility,
                                                        admitcard: exam.admitcard,
                                                        exampattern: exam.exampattern,
                                                        syllabus: exam.syllabus,
                                                        cutoff: exam.cutoff,
                                                        books: exam.books,
                                                        applicationstatus: exam.applicationstatus,
                                                        previousyearpapers: exam.previousyearpapers,
                                                        salaryandjobprofile: exam.salaryandjobprofile,
                                                        examanalysis: exam.examanalysis,
                                                        answerkey: exam.answerkey,
                                                        result: exam.result,
                                                        importantquestions: exam.importantquestions,
                                                        physicalendurancetest: exam.physicalendurancetest
                                                        })} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                                </td>
                                                <td><button type="button" onClick={handleExam({
                                                    name: exam.name, 
                                                    id: exam.id
                                                    })} className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
                                            </tr>
                                        )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='col-sm-12'>
                            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-xl">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="editModalLabel">Edit Exam</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
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
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={updateExam} className="btn btn-primary">Save Changes</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="deleteModalLabel">Delete Exam</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                        <form className="row" encType='multipart/form-data'>
                                            <div className="col-sm-12">
                                                <h4>Are you sure to delete this Exam?</h4>
                                                <input type='hidden' value={examID} name="examID"/>
                                            </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" onClick={deleteExam} className="btn btn-primary">Delete</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
            <Footer/>
        </div>
    )}else{
        return (
            <div className="admin">
                <Header/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-2 adminSidebar">
                            <Sidebar/>
                        </div>
                        <div className="col-sm-10 adminContent exams">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1>Exams</h1>
                                </div>
                                <div className="col-sm-12">
                                    <h5>No Exam Found!</h5>
                                </div>
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
