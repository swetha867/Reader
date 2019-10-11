
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
    var bookID;
    var wordID = req.body.word_id;
    var meaningID = req.body.meaning_id;
    var sentence = req.body.sentence;
    var book_name = req.body.book_name;
    var author_name = req.body.author_name;

//     bookID = 1; // must fetch from db
//     if(wordID == ""){
//         res.send({res: 'error'});
//         return;
//     }
//     mysqlConnection.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `meaning_id`, `sentence`) VALUES (?,?,?,?,?) ',
//     [userID, bookID, wordID, meaningID, sentence], (error, results, fields) => {
//         if(error){
//             res.send({res: 'error'});
//             return;
//         }
//         console.log("vote details inserted!");
//         res.send({res: 'success'});
//     }
//     );
// });
    if(wordID == ""){
            res.send({res: 'error'});
            return;
    }

    mysqlConnection.query(`Select id from books where book_name=? and author_name=?;`,[book_name,author_name], (err,result,fields) => {
        if(err) {
            res.send({res: 'error'});
            return;
        }
        if (result.length === 0) {
            // Storing the book with book name and author name in the Books Table
            mysqlConnection.query('Insert into books (`book_name`, `author_name`) VALUES (?,?);', [book_name,author_name], (err,result,fields) => {
                if(err) {
                    res.send({res: 'error'});
                    return;
                }
            });
        }
        // Returning the bookid for the given book name and author name
        mysqlConnection.query(`Select id from books where book_name=? and author_name=?;`,[book_name,author_name], (err,result,fields) => {
            if(err) {
                res.send({res: 'error'});
                return;
            }
            bookID = result[0].id;
            // Storing all the attributes in votes table with book id
            mysqlConnection.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `meaning_id`, `sentence`) VALUES (?,?,?,?,?) ',
            [userID, bookID, wordID, meaningID, sentence], (req,resp) => {
            console.log("vote details inserted!");
            res.send({response: "Vote Details Inserted!"});
            });
        });
});
    // console.log('outside',bookID);
    
});

module.exports = router;