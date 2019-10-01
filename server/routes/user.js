
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
    mysqlConnection.query('Select * from users where student_id = ?', [studentID], (err,rows,fields) => {
        if (!err && rows.length === 0) {
            mysqlConnection.query('INSERT INTO users (`student_id`, `email`) VALUES (?,?) ', 
            [studentID, email], (req,resp) => {
            console.log("Data Inserted " + resp.insertId);
            res.send({ user_id: resp.insertId });
            });
        }
        else  if (err) {
            return `Here is the error storing the user: ${err}`;
        }
        else if (rows.length !== 0 && !err) {
            console.log(`User ID:${rows[0].student_id} already exists in the database `);
            res.send({user_id: rows[0].student_id});
        }
    })
    
})
module.exports = router;