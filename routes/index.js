let express = require('express');
const User = require('../lib/user');
let router = express.Router();

let connection = require('../lib/db');

const user = new User();
/* GET home page. */
/*router.get('/', function(req, res, next) {
  connection.query('SELECT * FROM topics ORDER BY id desc',function(err,rows)     {

    if(err){
      req.flash('error', err);
      res.render('index',{page_title:"topics - Node.js",data:''});
    }else{

      res.render('index',{page_title:"topics - Node.js",data:rows});
    }

  });
});*/

router.get('/', (req,res,next) => {
    let user = req.session.user;
    // If there is a session named user that means the use is logged in. so we redirect him to home page by using /home route below
    if(user) {
        res.redirect('/home');
        return;
    }
    // IF not we just send the index page.
    res.render('index', {title:"Страница регистрации"});
});

//get home page
router.get('/home', (req,res,next) => {
    let user = req.session.user;

    if(user) {
        res.render('home', {opp:req.session.opp, name:user.fullname});
        return;
    }
    res.redirect('/');
});

//post login data
router.post('/login', (req, res, next) => {
    user.login(req.body.username, req.body.password, function(result) {
        if(result) {
            // Store the user data in a session.
            req.session.user = result;
            req.session.opp = 1;
            // redirect the user to the home page.
            res.redirect('/home');
        }else {
            // if the login function returns null send this error message back to the user.
            res.send('Username/Password incorrect!');
        }
    })
});

//post register form
router.post('/register', (req, res, next) =>{
    // prepare an object containing all user inputs.
    let userInput = {
        username: req.body.username,
        fullname: req.body.fullname,
        password: req.body.password
    };
    // call create function. to create a new user. if there is no error this function will return it's id.
    user.create(userInput, function(lastId) {
        // if the creation of the user goes well we should get an integer (id of the inserted user)
        if(lastId) {
            // Get the user data by it's id. and store it in a session.
            user.find(lastId, function(result) {
                req.session.user = result;
                req.session.opp = 0;
                res.redirect('/home');
            });

        }else {
            console.log('Error creating a new user ...');
        }
    });

});
// Get loggout page
router.get('/loggout', (req, res, next) => {
    // Check if the session is exist
    if(req.session.user) {
        // destroy the session and redirect the user to the index page.
        req.session.destroy(function() {
            res.redirect('/');
        });
    }
});
module.exports = router;
