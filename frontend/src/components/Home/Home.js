import React from "react";
import './home.css';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../includes/Header/Header";
import Banner from "../../includes/Banner/Banner";
import Footer from "../../includes/Footer/Footer";
import TopExams from "../../includes/TopExams/TopExams";
import TopCategories from "../../includes/TopCategories/TopCategories";
import PracticeQuizzes from "../../includes/PracticeQuizzes/PracticeQuizzes";
import PopularArticles from '../../includes/PopularArticles/PopularArticles';

const Home = () => {


    return(
        <div className="home">
            <Header/>
            <Banner/>
            <TopCategories/>
            <TopExams/>
            <PracticeQuizzes/>
            <PopularArticles/>
            <Footer/>
        </div>
    )
}

export default Home;