
const express = require('express');
const mysqlConnection = require('../database/db');
const router = express.Router();

router.get('/', (req,res) => {
    mysqlConnection.query('SELECT * FROM Users', (err,rows,fields) => {
        if (!err) {
            res.send(rows);
            console.log('Fetched');
        }
        else {
            console.log(`Here is the error ${err}`)
        }
    })
});

router.post('/', (req,res) => {
    console.log('Student ID entered from UI is'+ req.body.studID);
    console.log('Student Email entered from UI is'+ req.body.email);
    var studentID = req.body.studID;
    var email = req.body.email
    mysqlConnection.query('INSERT INTO Users (`Student_ID`, `Email_ID`) VALUES (?,?) ', 
    [studentID, email], (req,resp) => {
        console.log("Data Inserted " + resp.insertId);
        res.send(JSON.stringify({ user_id: resp.insertId }));
    }
    );
})
module.exports = router;