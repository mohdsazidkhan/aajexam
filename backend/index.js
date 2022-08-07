import express from "express"
import cors from "cors"
import multer from 'multer';
import mysql  from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aajexam'
});

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    console.log("Database Connected!");
    // var user = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(100), role VARCHAR(255), password VARCHAR(255))";
    // connection.query(user, function (err, result) {
    //     if (err) throw err;
    //     console.log("Users Table Created");
    // });
    // var contact = "CREATE TABLE contacts (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(100), subject VARCHAR(255), message VARCHAR(255))";
    // connection.query(contact, function (err, result) {
    //     if (err) throw err;
    //     console.log("Users Table Created");
    // });
    // var category = "CREATE TABLE categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))";
    // connection.query(category, function (err, result) {
    //     if (err) throw err;
    //     console.log("Categories Table Created");
    // });
    // var blog = "CREATE TABLE blogs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), author VARCHAR(255), publishedAt VARCHAR(100), categoryID VARCHAR(255), categoryName VARCHAR(255), photo VARCHAR(255), content TEXT(1000))";
    // connection.query(blog, function (err, result) {
    //     if (err) throw err;
    //     console.log("Blogs Table Created");
    // });
    // var exam = "CREATE TABLE exams (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), categoryID VARCHAR(255), categoryName VARCHAR(255), content TEXT(1000))";
    // connection.query(exam, function (err, result) {
    //     if (err) throw err;
    //     console.log("Exams Table Created");
    // });
    // var quiz = "CREATE TABLE quizzes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), categoryID VARCHAR(255), categoryName VARCHAR(255))";
    // connection.query(quiz, function (err, result) {
    //     if (err) throw err;
    //     console.log("Quizzes Table Created");
    // });
    
    // var question = "CREATE TABLE questions (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), options TEXT(255), answer VARCHAR(255), quizID VARCHAR(255), quizName VARCHAR(255))";
    // connection.query(question, function (err, result) {
    //     if (err) throw err;
    //     console.log("Questions Table Created");
    // });

    // var score = "CREATE TABLE scores (id INT AUTO_INCREMENT PRIMARY KEY, userID INT(11), score INT(11), quizName VARCHAR(255), quizID INT(11))";
    // connection.query(score, function (err, result) {
    //     if (err) throw err;
    //     console.log("Scores Table Created");
    // });
});

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)
      //cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },  
  });
  
  const limits = {
      fileSize : 40000000
  }
  
  //fileFilter function controls which files should be uploaded. req = request being made. file = contains file info. cb = callback function to tell multer when we are done filtering the file. send back an error message to the client with cb.
  const fileFilter =(req, file, cb) => {
    //if the file is not a jpg, jpeg, or png file, do not upload it multer; reject it.
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('File must be of type JPG, JPEG, or PNG and nore more than 2MB in size'))
    }
    //undefined = nothing went wrong; true = that is true, nothing went wrong, accept the upload.
    cb(undefined, true)
  }
  
  //set up the multer middleware
  const upload = multer({
      storage: storage,
      limits: limits,
      fileFilter: fileFilter
      // filename: filename
  })
  

//Routes
app.get('/', (req, res) =>{
    res.send("MY API")
})

app.post('/register', (req, res) =>{
    const {name, email, phone, role, password} = req.body;
    const inputData = {
        name, email, phone, role, password
    }
    // check unique email address
    var sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email] ,function (err, data, fields) {
        if(err) throw err
        if(data.length>1){
            res.send({message:email+ "was already exist"});
        }else{   
        // save users data into database
        var sql = 'INSERT INTO users SET ?';
        connection.query(sql, inputData, function (err, data) {
            if (err) throw err;
        });
        }
        res.send( {message:"Your are Successfully Registered" } );
    })
})

app.post('/adduser', (req, res) =>{
    const {name, email, phone, role, password} = req.body;
    const inputData = {
        name, email, phone, role, password
    }
    // check unique email address
    var sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email] ,function (err, data, fields) {
        if(err) throw err
        if(data.length>1){
            res.send({message:email+ "was already exist"});
        }else{   
        // save users data into database
        var sql = 'INSERT INTO users SET ?';
        connection.query(sql, inputData, function (err, data) {
            if (err) throw err;
        });
        }
        res.send( {message:"Your are Successfully Registered" } );
    })
})

app.post("/updateuser", function (req, res) {   
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const role = req.body.role;
    var sql = `UPDATE users SET name = '${name}', email = '${email}', phone = '${phone}', password = '${password}', role = '${role}' WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'User Updated Successfully', data});
        }
    });
});

app.delete("/deleteuser", (req, res) => {
    var sql = `DELETE FROM users WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'User Deleted Successfully', data});
        }
    });
});

app.post('/login', (req, res) =>{
    const {email, password} = req.body
    var sql = 'SELECT * FROM users WHERE email = ? AND password =?';
    connection.query(sql, [email, password], function (err, data, fields) {
        if(err) throw err
        if(data.length>0){
            res.send({message: "Successfully LoggedIn", data: data})
        }else{
            res.send({message: "Your Email or Password is Wrong!"});
        }
    })
})

app.post('/contact', (req, res) =>{
    const {name, email, phone, subject, message} = req.body
    if(name && email && phone && subject && message){
        var sql = 'INSERT INTO contacts SET ?';
        const inputData = {
            name, email, phone, subject, message
        }
        connection.query(sql, inputData, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Successfully Sent'
            });
        }
      });
    }
})

app.post('/addcategory', (req, res) =>{
    const {name} = req.body
    if(name){
        var sql = 'INSERT INTO categories SET ?';
        const inputData = {
            name
        }
        connection.query(sql, inputData, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Category Successfully Added'
            });
        }
      });
    }
})

app.post("/updatecategory", function (req, res) {   
    const name = req.body.name;
    var sql = `UPDATE categories SET name = '${name}' WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Category Updated Successfully', data});
        }
    });
});

app.delete("/deletecategory", (req, res) => {
    var sql = `DELETE FROM categories WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Category Deleted Successfully', data});
        }
    });
});

app.post("/updatequiz", function (req, res) {   
    const name = req.body.name;
    const categoryID = req.body.categoryID;
    const categoryName = req.body.categoryName;
    const questions = req.body.questions;
    const totaltime = req.body.totaltime;
    var sql = `UPDATE quizzes SET name = '${name}', categoryID = '${categoryID}', categoryName = '${categoryName}', questions = '${questions}', totaltime = '${totaltime}' WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Category Updated Successfully', data});
        }
    });
});

app.delete("/deletequiz", (req, res) => {
    var sql = `DELETE FROM quizzes WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Quiz Deleted Successfully', data});
        }
    });
});

app.get("/getusers", function (req, res) {   
    var sql = 'SELECT * FROM users';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Users Get Successfully', data});
        }
    });
});

app.get("/getcontacts", function (req, res) {   
    var sql = 'SELECT * FROM contacts';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Contacts Get Successfully', data});
        }
    });
});

app.get("/getcategories", function (req, res) {   
    var sql = 'SELECT * FROM categories';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Categories Get Successfully', data});
        }
    });
});

app.post('/addblog', upload.single('photo'), (req, res) =>{

    const name = req.body.name;
    const author = req.body.author;
    const publishedAt = req.body.publishedAt;
    const categoryID = req.body.categoryID;
    const categoryName = req.body.categoryName;
    const photo = req.file.filename;
    const content = req.body.content;

    const inputData = {
        name,
        author,
        publishedAt,
        categoryID,
        categoryName,
        photo,
        content
    }
 
    var sql = 'INSERT INTO blogs SET ?';
    connection.query(sql, inputData, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Blog Successfully Added'
            });
        }
    });
})

app.post("/updateblog", upload.single('photo'), function (req, res) {   

    const name = req.body.name;
    const author = req.body.author;
    const publishedAt = req.body.publishedAt;
    const categoryID = req.body.categoryID;
    const categoryName = req.body.categoryName;
    const photo = req.file.filename;
    const content = req.body.content;

    var sql = `UPDATE blogs SET name = '${name}', author = '${author}', publishedAt = '${publishedAt}', categoryID = '${categoryID}', categoryName = '${categoryName}', photo = '${photo}', content = '${content}' WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Blog Updated Successfully', data});
        }
    });
});

app.delete("/deleteblog", (req, res) => {
    var sql = `DELETE FROM blogs WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Blog Deleted Successfully', data});
        }
    });
});

app.get("/getblogs", function (req, res) {   
    var sql = 'SELECT * FROM blogs';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Blogs Get Successfully', data});
        }
    });
});

app.get("/getblogdetails", function (req, res) {   
    const id = req.query.id;
    var sql = 'SELECT * FROM blogs WHERE id = ?';
    connection.query(sql, [id], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Blog Details Successfully', data});
        }
    });
});

app.get("/getblogsbycategory", function (req, res) {   
    const categoryID = req.query.id;
    var sql = 'SELECT * FROM blogs WHERE categoryID = ?';
    connection.query(sql, [categoryID], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Blog Get Successfully', data});
        }
    });
});

app.get("/getblogsbyauthor", function (req, res) {   
    const author = req.query.name;
    var sql = 'SELECT * FROM blogs WHERE author = ?';
    connection.query(sql, [author], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Blog Get Successfully', data});
        }
    });
});

app.post('/addexam', (req, res) =>{

    const name = req.body.name;
    const categoryID = req.body.categoryID;
    const categoryName = req.body.categoryName;
    const overview = req.body.overview;
    const vacancies = req.body.vacancies;
    const applyonline = req.body.applyonline;
    const eligibility = req.body.eligibility;
    const admitcard = req.body.admitcard;
    const exampattern = req.body.exampattern;
    const syllabus = req.body.syllabus;
    const cutoff = req.body.cutoff;
    const books = req.body.books;
    const applicationstatus = req.body.applicationstatus;
    const previousyearpapers = req.body.previousyearpapers;
    const salaryandjobprofile = req.body.salaryandjobprofile;
    const examanalysis = req.body.examanalysis;
    const answerkey = req.body.answerkey;
    const result = req.body.result;
    const importantquestions = req.body.importantquestions;
    const physicalendurancetest = req.body.physicalendurancetest;

    const inputData = {
        name,
        categoryID,
        categoryName,
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
    }

    var sql = 'INSERT INTO exams SET ?';
    connection.query(sql, inputData, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Exam Successfully Added'
            });
        }
    });
})

app.post("/updateexam", function (req, res) {   

    const name = req.body.name;
    const categoryID = req.body.categoryID;
    const categoryName = req.body.categoryName;
    const overview = req.body.overview;
    const vacancies = req.body.vacancies;
    const applyonline = req.body.applyonline;
    const eligibility = req.body.eligibility;
    const admitcard = req.body.admitcard;
    const exampattern = req.body.exampattern;
    const syllabus = req.body.syllabus;
    const cutoff = req.body.cutoff;
    const books = req.body.books;
    const applicationstatus = req.body.applicationstatus;
    const previousyearpapers = req.body.previousyearpapers;
    const salaryandjobprofile = req.body.salaryandjobprofile;
    const examanalysis = req.body.examanalysis;
    const answerkey = req.body.answerkey;
    const result = req.body.result;
    const importantquestions = req.body.importantquestions;
    const physicalendurancetest = req.body.physicalendurancetest;

    var sql = `UPDATE exams SET name = '${name}', categoryID = '${categoryID}', categoryName = '${categoryName}', overview = '${overview}', vacancies = '${vacancies}', applyonline = '${applyonline}',  eligibility = '${eligibility}', admitcard = '${admitcard}', exampattern = '${exampattern}', syllabus = '${syllabus}', cutoff = '${cutoff}', books = '${books}', applicationstatus = '${applicationstatus}', previousyearpapers = '${previousyearpapers}', salaryandjobprofile = '${salaryandjobprofile}', examanalysis = '${examanalysis}', answerkey = '${answerkey}', result = '${result}', importantquestions = '${importantquestions}', physicalendurancetest = '${physicalendurancetest}' WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Exam Updated Successfully', data});
        }
    });
});

app.delete("/deleteexam", (req, res) => {
    var sql = `DELETE FROM exams WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Exam Deleted Successfully', data});
        }
    });
});


app.get("/getexams", function (req, res) {   
    var sql = 'SELECT * FROM exams';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Exams Get Successfully', data});
        }
    });
});

app.get("/getexamdetails", function (req, res) {   
    const id = req.query.id;
    var sql = 'SELECT * FROM exams WHERE id = ?';
    connection.query(sql, [id], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Exam Details Get Successfully', data});
        }
    });
});

app.get("/getexamquizzes", function (req, res) {   
    const id = req.query.id;
    var sql = 'SELECT * FROM quizzes WHERE categoryID = ?';
    connection.query(sql, [id], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Exam Quizzes Get Successfully', data});
        }
    });
});

app.get("/getallexams", function (req, res) {   
    const id = req.query.id;
    var sql = 'SELECT * FROM exams WHERE categoryID = ?';
    connection.query(sql, [id], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Exams Get Successfully', data});
        }
    });
});

app.post('/addquiz', (req, res) =>{

    const name = req.body.name;
    const categoryID = req.body.categoryID;
    const categoryName = req.body.categoryName;
    const questions = req.body.questions;
    const totaltime = req.body.totaltime;

    const inputData = {
        name,
        categoryID,
        categoryName,
        questions,
        totaltime
    }
    var sql = 'INSERT INTO quizzes SET ?';
    connection.query(sql, inputData, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Quiz Successfully Added'
            });
        }
    });
})

app.get("/getquizzes", function (req, res) {   
    var sql = 'SELECT * FROM quizzes';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Quizzes Get Successfully', data});
        }
    });
});

app.post('/addquestion', (req, res) =>{

    const question = req.body.question;
    const optionA = req.body.option1;
    const optionB = req.body.option2;
    const optionC = req.body.option3;
    const optionD = req.body.option4;
    const answer = req.body.answer;
    const quizName = req.body.quizName;
    const quizID = req.body.quizID;
    
    const sql = `INSERT INTO questions VALUES ('${uuidv4()}','${question}','${optionA}','${optionB}','${optionC}','${optionD}','${answer}','${quizID}','${quizName}')`;
    connection.query(sql, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Question Successfully Added'
            });
        }
    });
})

app.post("/updatequestion", function (req, res) {   

    const question = req.body.question;
    const optionA = req.body.option1;
    const optionB = req.body.option2;
    const optionC = req.body.option3;
    const optionD = req.body.option4;
    const answer = req.body.answer;
    const quizName = req.body.quizName;
    const quizID = req.body.quizID;

    var sql = `UPDATE questions SET question = '${question}', optionA = '${optionA}', optionB = '${optionB}', optionC = '${optionC}', optionD = '${optionD}', answer = '${answer}', quizID = '${quizID}', quizName = '${quizName}' WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Question Updated Successfully', data});
        }
    });
});

app.delete("/deletequestion", (req, res) => {
    var sql = `DELETE FROM questions WHERE id = ${req.query.id}`;
    connection.query(sql, function (err, data){
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Question Deleted Successfully', data});
        }
    });
});

app.post('/addscore', (req, res) =>{

    const userId = req.body.userId;
    const score = req.body.score;
    const totalQ = req.body.totalQ;
    const quizName = req.body.quizname;
    const quizID = req.body.id;
    
    const sql = `INSERT INTO scores VALUES ('${uuidv4()}','${userId}','${score}','${totalQ}','${quizName}','${quizID}')`;
    connection.query(sql, function (error, data){
        if (error) {
                console.log("error ocurred",error);
                res.send({
                message: 'Something Went Wrong!'
            })
        }else{
                console.log('results: ', data);
            res.send({
                message: 'Score Successfully Added'
            });
        }
    });
})


app.get("/getscores", function (req, res) {   
    const userId = req.query.userId;
    var sql = 'SELECT * FROM scores WHERE userId = ?';
    connection.query(sql, [userId], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Scores Get Successfully', data});
        }
    });
});

app.get("/getallquestions", function (req, res) {   
    var sql = 'SELECT * FROM questions';
    connection.query(sql, function (err, data, fields) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'All Questions Get Successfully', data});
        }
    });
});

app.get("/getquestions", function (req, res) {   
    const id = req.query.id;
    var sql = 'SELECT * FROM questions WHERE quizID = ?';
    connection.query(sql, [id], function (err, data) {
        if(err){
            res.send({message: 'Something Went Wrong!'})
        }else{
            res.send({message: 'Questions Get Successfully', data});
        }
    });
});


app.listen(4000, () =>{
    console.log('Started on Port 4000');
})