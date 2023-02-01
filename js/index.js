//require express, installed via npm
const express = require('express');
//require mysql, installed via npm
const mysql = require('mysql2');
//require email.js
const sendVerificationEmail = require('./email.js');
//require crypto, installed via npm
const crypto = require("crypto");
//create a user model
const User = require('../models/user.model.js');
//create our app
const app = express();
//create bcrypt, installed via npm
const bcrypt = require('bcrypt');
//create jwt, installed via npm
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//create router
var router = express.Router();
const JWT_SECRET = crypto.randomBytes(64).toString('hex');

//set the view engine
app.set('view engine', 'ejs');
//set where views are located
app.set('views', '../views')

//create connection to database
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'cats'
});

//connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

//start the express server
app.listen(3000, function (){
    console.log("Server started on port 3000");
});

app.use(async (req, res, next) => {
    console.log(req.cookies);
    const token = false;
    console.log(token);
    if (!token) {
      isLoggedIn = false;
      return next();
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
      isLoggedIn = true;
      next();
    } catch (error) {
      isLoggedIn = false;
      next();
    }
  });

//define a route handler for the default home page
app.get('/', function (req, res){
    res.render("home", { isLoggedin: isLoggedIn});
});

//get register page
app.get('/register', function (req, res) {
    res.render('register');
});

//get login page
app.get('/login', function (req, res) {
    res.render('login');
});

//get settings page
app.get('/settings', function (req, res) {
    res.render('settings');
});

//get post page
app.get('/post', function (req, res) {
    res.render('post');
});

//get reset password page
app.get('/reset', function (req, res) {
    res.render('reset');
});

//get verification-sent page
app.get('/verification-sent', function (req, res) {
    res.render('verification-sent');
});

//get verification-success page
app.get('/verification-success', function (req, res) {
    res.render('verification-success');
});
//confirm users email
app.get('/confirm-email/:token', async (req, res) => {
    const token = req.params.token;
    try {
      const user = await User.findOne({ token: token });
      if (!user) {
        return res.status(400).send('Invalid token');
      }
      user.email_verified = true;
      //user.token = null;
      await user.save();
      res.render('verification-success');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
    });
    app.get('/myposts', (req, res) => {
        if (!req.user) {
          return res.redirect('/login');
        }
      
        res.render('myposts');
      });
//post register page
app.post('/register', async function (req, res) {
    const saltRounds = 10;
    const token = crypto.randomBytes(16).toString('hex');
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, saltRounds);
    const name = req.body.name;
    User.create({
        email: email,
        password: password,
        name: name,
        token: token
    })
    .then(user => {
        sendVerificationEmail(req.body.email, token);
    })
    .catch(error => {
        console.log(error);
        res.status(500).send('Failed to register user');
    });

    res.redirect('verification-sent');
});

app.post('/login', async function (req, res) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send('Invalid email or password');
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).send('Invalid email or password');
      }
      if (!user.email_verified) {
        return res.status(400).send('Please verify your email first');
      }
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 3600 });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  const checkAuth = (req, res, next) => {
    try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
    } catch (error) {
    res.redirect('/login');
    }
    };

    app.use(async (req, res, next) => {
        console.log(req.cookies);
        const token = (req.cookies.token);
        console.log(token);
        if (!token) {
          req.isLoggedIn = false;
          return next();
        }
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.userId = decoded.id;
          req.isLoggedIn = true;
          next();
        } catch (error) {
          req.isLoggedIn = false;
          next();
        }
      });