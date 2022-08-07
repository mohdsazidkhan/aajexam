import React from 'react'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";

function About() {
    return (
        <div className='AppContainer'>
            <Header/>
            <div className="container">
                <div className="row">
                <h1>About Us !</h1>
                <h3>Welcome To <span>AajExam</span></h3>
                <p><span>AajExam</span> is a Professional <span>Educational</span> Platform. Here we will provide you only interesting content, which you will like very much. We're dedicated to providing you the best of <span>Educational</span>, with a focus on dependability and <span>Online Learning</span>. We're working to turn our passion for <span>Educational</span> into a booming online website. We hope you enjoy our <span >Educational</span> as much as we enjoy offering them to you.</p>
                <p>I will keep posting more important posts on my Website for all of you. Please give your support and love.</p>
                <p>Thanks For Visiting Our Site</p>
                <p>Have a nice day !</p>
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default About
