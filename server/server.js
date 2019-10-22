const express = require('express');
const app = express();
const port = 6010;
const bodyParser = require('body-parser');
const userController = require('./routes/user');
const lookupController = require('./routes/lookup');
const votingController = require('./routes/vote');
const pageController = require('./routes/page');
const learningController = require('./routes/learning');
const instController = require('./routes/inst');
const passport = require('passport');




//logging
var morgan = require('morgan')
app.use(morgan('tiny'))

app.set('view engine', 'ejs');
app.set('views', './views');



// Auth
require('./config/passport.js')(app);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    done(null, id);
});

function authProtectInst(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.isTeacher !== 1) {
        res.redirect('/auth/logout');
      } else {
        next();
      }
    } else {
      res.redirect('/auth/login');
    }
  }


//app.use(bodyParser()); // ??
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', userController);
app.use('/lookup', lookupController);
app.use('/votes', votingController);
app.use('/page', pageController);
app.use('/learning', learningController);
app.use('/instructor', authProtectInst, instController);



// DB CONNECTION STARTS

// Create Table Users (
// 	ID int NOT NULL AUTO_INCREMENT,
//     Student_ID varchar(255),
//     PRIMARY KEY (Student_ID),
//     Email_ID varchar(255)
// );

// var mysqlConnection = mysql.createConnection({
//     host: 'koob-test-db.c9r4wsiwqsvu.us-east-2.rds.amazonaws.com',
//     user: 'admin',
//     port: '3306',
//     password:'koobproject',
//     database: 'innodb'
// });
// var mysqlConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password:'',
//     database: 'Koob_test'
// });

// mysqlConnection.connect((err) => {
//     if(!err) {
//         console.log('DB connected!') // DB SUCCESSFUL
//     }
//     else {
//         console.log(err,`Here is the error:${JSON.stringify(err)}`)
//     }
// });


app.get('/', (req,res) => {
    res.send('Hello world');
});

app.listen(port,  () => {
    console.log(`My express server is running at ${port}!`);
});


// app.get('/users', (req,res) => {
//     mysqlConnection.query('SELECT * FROM Users', (err,rows,fields) => {
//         if (!err) {
//             res.send(rows);
//         }
//         else {
//             console.log(`Here is the error ${err}`)
//         }
//     })
// });



// app.get('/books', (req,res) => {
//     mysqlConnection.query('SELECT * FROM `Book Table`', (err,rows,fields) => {
//         if (!err) {
//             res.send(rows);
//         }
//         else {
//             console.log(`Here is the error ${err}`)
//         }
//     })
// });

// app.get('/users/:id', (req,res) => {
//     mysqlConnection.query('SELECT * FROM USER WHERE ID = ?',[req.params.id], (err,rows,fields) => {
//         if(!err) {
//             res.send(rows);
//             console.log(res);
//         }
//         else {
//             console.log('error');
//         }
//     })
// })

// DB CONNECTION OVER


// app.get('/', (req,res) => {
//     res.send('hello world!');
// });

/* 
database/db.js

const db = {
    db_username: 
    pas:
}

db.connection('...');

*/

// const db = reuire('../database/db');

// app.post('/sign', (req, res) => {
//     // After sign in form submission

//     // Gat name from req

//     // Insert into users table
//     // db...("INSERT")


//     // Send resposnse back to the client
// //    res.redirect('/home');
// })


