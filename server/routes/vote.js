
var express = require('express');
const mysqlConnection = require('../database/db');
const router = express.Router();

// For now GET call is to see the data on postman
router.get('/', (req,res) => {
    mysqlConnection.query('Select * from votes', (err, rows, fields) => {
        if(!err) {
            res.send(rows);
            console.log('Information from Votes Table Fetched');
        }
        else {
            res.send(`Error fetching the voting details: ${err}`);
        }
    })
});

// POST call to enter the information in votes Table
// Meaning id 0 means student is not sure which meaning is selected
// When student lookup for word anytime, we should recieve a post request here with meaningId as null
router.post('/', (req,res) => {
    var userID = req.body.user_id;
    var bookID = req.body.book_id;
    var wordID = req.body.word_id;
    var meaningID = req.body.meaning_id;
    var sentence = req.body.sentence;
    mysqlConnection.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `meaning_id`, `sentence`) VALUES (?,?,?,?,?) ',
    [userID, bookID, wordID, meaningID, sentence], (req,resp) => {
        console.log("vote details inserted!");
    }
    );
});


module.exports = router;