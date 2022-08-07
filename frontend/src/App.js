import './App.css';
import React, {useState,useEffect} from "react";
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import Home from './components/Home/Home';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import Exams from './components/Exams/Exams';
import ExamDetails from './components/Exams/ExamDetails';
import Categories from './components/Categories/Categories';
import Questions from './components/Questions/Questions';
import AllExams from './components/Categories/AllExams';
import Quizzes from './components/Quizzes/Quizzes';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Blogs from './components/Blogs/Blogs';
import BlogByCategory from './components/Blogs/BlogByCategory';
import BlogByAuthor from './components/Blogs/BlogByAuthor';
import BlogDetails from './components/Blogs/BlogDetails';
import Profile from './components/Profile/Profile';
import Admin from './Admin/Admin';
import AddBlog from "./Admin/components/Blogs/AddBlog";
import AdminContacts from "./Admin/components/Contacts/Contacts";
import AdminUsers from "./Admin/components/Users/Users";
import AddUser from "./Admin/components/Users/AddUser";
import AdminCategories from "./Admin/components/Categories/Categories";
import AddCategory from "./Admin/components/Categories/AddCategory";
import AdminBlogs from "./Admin/components/Blogs/Blogs";
import AdminQuestions from "./Admin/components/Questions/Questions";
import AddQuestion from "./Admin/components/Questions/AddQuestion";
import AdminExams from "./Admin/components/Exams/Exams";
import AddExam from "./Admin/components/Exams/AddExam";
import AdminQuizzes from "./Admin/components/Quizzes/Quizzes";
import AddQuiz from "./Admin/components/Quizzes/AddQuiz";
import AdminProfile from "./Admin/components/Profile/Profile";

function App() {

  const [role, setRole] = useState('');
  
  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, [])

  if(role === 'admin'){
  return (
    <div className='App'>
      <Router>
   
        <Routes>
          <Route path="/admin" element={ <Admin/> }/>
          <Route path="/addblog" element={<AddBlog/>}/>
          <Route path="/blogs" element={<AdminBlogs/>}/>
          <Route path="/contacts" element={<AdminContacts/>}/>
          <Route path="/exams" element={<AdminExams/>}/>
          <Route path="/users" element={<AdminUsers/>}/>
          <Route path="/adduser" element={<AddUser/>}/>
          <Route path="/categories" element={<AdminCategories/>}/>
          <Route path="/allquestions" element={<AdminQuestions/>}/>
          <Route path="/addquestion" element={<AddQuestion/>}/>
          <Route path="/addcategory" element={<AddCategory/>}/>
          <Route path="/addexam" element={<AddExam/>}/>
          <Route path="/quizzes" element={<AdminQuizzes/>}/>
          <Route path="/addquiz" element={<AddQuiz/>}/>
          <Route path="/blogs" element={<Blogs/>}/>
          <Route path="/profile" element={<AdminProfile/>}/>
        </Routes>
      </Router>
    </div>
  )
  }else{
  return (
    <div className='App'>
      <Router>
      <Routes>
        <Route exact path="/" element={ <Home/> }/>
        <Route path="/blogs" element={<Blogs/>}/>
        <Route path="/blogbycategory" element={<BlogByCategory/>}/>
        <Route path="/blogbyauthor" element={<BlogByAuthor/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/exams" element={<Exams/>}/>
        <Route path="/examdetails" element={<ExamDetails/>}/>
        <Route path="/categories" element={<Categories/>}/>
        <Route path="/questions" element={<Questions/>}/>
        <Route path="/allexams" element={<AllExams/>}/>
        <Route path="/quizzes" element={<Quizzes/>}/>
        <Route path="/about-us" element={<About/>}/>
        <Route path="/contact-us" element={<Contact/>}/>
        <Route path="/blogdetails" element={<BlogDetails/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
      </Router>
    </div>
  )
  }
}

export default App;
