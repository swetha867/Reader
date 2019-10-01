
const express = require('express');
const mysqlConnection = require('../database/db');
const router = express.Router();

router.get('/', (req,res) => {
    mysqlConnection.query('SELECT * FROM users', (err,rows,fields) => {
        if (!err) {
            res.send(rows);
            console.log('Users Fetched!');
        }
        else {
            console.log(`Here is the error ${err}`)
        }
    })
});

router.post('/', (req,res) => {
    var studentID = req.body.student_id;
    var email = req.body.email;
    mysqlConnection.query('INSERT INTO users (`student_id`, `email`) VALUES (?,?) ', 
    [studentID, email], (req,resp) => {
        console.log("Data Inserted " + resp.insertId);
        //res.send({ user_id: resp.insertId });
    }
    );
})
module.exports = router;