import React,{useState,useEffect} from 'react'
import './profile.css'
import Header from "../../includes/Header/Header";
import Footer from "../../includes/Footer/Footer";
import axios from 'axios';
import {
    FacebookIcon,
    FacebookShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
    TelegramIcon,
    TelegramShareButton,
    LinkedinIcon,
    LinkedinShareButton
} from "react-share";

function Profile() {

    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const phone = localStorage.getItem("userPhone");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    const [scores, setScores] = useState([]);

    const shareUrl = 'https://www.aajexam.com';

    console.log(scores)

    useEffect(() => {
        getScores();
        return () => {
            setScores({}); // This worked for me
        };
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const getScores = () => {
        axios.get('http://localhost:4000/getscores?userId='+userId)
            .then(res => {
                if(res){
                    setScores(res.data.data);
                }
            })
            .catch(err => {
                console.log(err);
        });
    }

    return (
        <div className='AppContainer'>
            <Header/>
            <div className="container">
                <div className="row">
                    <div className='uiprofile'>
                        <h1>Profile</h1>
                        <h3>Name: {name}</h3>
                        <h3>Email: {email}</h3>
                        <h3>Phone No.: {phone}</h3>
                        <h3>Role: {role}</h3>
                    </div>
                    <div className='table-responsive'>
                    <table>
                        <thead>
                            <th>#</th>
                            <th>Quiz Name</th>
                            <th>Score</th>
                        </thead>
                    <tbody>
                    {scores.map((score, index) => {
                    return(
                    <tr className="col-sm-12" key={score.id}>
                        <td>{index+1+'.'}</td>
                        <td>{score.quizName}</td>
                        <td>{Math.round((score.score/score.totalQ)*100)}%</td>
                        <td>

                        <FacebookShareButton
                            url={shareUrl}
                            quote={score.quizName}
                        >
                            <FacebookIcon size={32} round />
                        </FacebookShareButton>


                        <TwitterShareButton
                            url={shareUrl}
                            title={score.quizName}
                        >
                            <TwitterIcon size={32} round />
                        </TwitterShareButton>

                            

                        <TelegramShareButton
                            url={shareUrl}
                            title={score.quizName}
                        >
                            <TelegramIcon size={32} round />
                        </TelegramShareButton>

                         

                        <WhatsappShareButton
                            url={shareUrl}
                            title={score.quizName}
                            separator=":: "
                        >
                            <WhatsappIcon size={32} round />
                        </WhatsappShareButton>

                       
                        <LinkedinShareButton url={shareUrl}>
                            <LinkedinIcon size={32} round />
                        </LinkedinShareButton>
                         

                        </td>
                    </tr>    
                    )
                    })}
                    </tbody>
                    </table>
                    </div>
                </div>
            </div>        
            <Footer/>
        </div>
    )
}

export default Profile
