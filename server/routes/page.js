const express = require('express');
const mysqlConnection = require('../database/db');
const router = express.Router();
var bookID;

router.post('/', (req,res) => {
   
    var userID = req.body.userID;
    var page_number = req.body.page_number;
    var seconds = req.body.seconds;
    var book_name = req.body.book_name;
    var author_name = req.body.author_name;
    
    mysqlConnection.query(`Select id from books where book_name=? and author_name=?;`, [book_name, author_name],  (err, result, fields) => {
        if (err) {
            res.send('Error is in finding book id', err);
        }
        if (result.length == 0) {
            mysqlConnection.query('Insert into books (`book_name`, `author_name`) VALUES (?,?);', [book_name, author_name], (err, result, fields) => {
                if (err) {
                    res.send('Error is in inserting book name and author of that book', err);
                }
                bookID = result.insertId;
                mysqlConnection.query('Insert into PageTable (`user_id`,`book_id`,`page_number`,`seconds`) VALUES (?,?,?,?);', [userID, bookID, page_number, seconds], (err, result, fields) => {
                    if (err) {
                        res.send('Error in inserting the page statistics', err);
                    }
                    else {
                        res.send('Page stats are inserted successfully');
                    }
                });
            });
        }
        else if (result.length !== 0) {
            bookID = result[0].id;
            mysqlConnection.query('Insert into PageTable (`user_id`,`book_id`,`page_number`,`seconds`) VALUES (?,?,?,?);', [userID, bookID, page_number, seconds], (err, result, fields) => {
                if (err) {
                    res.send('Error in inserting the page statistics', err);
                }
                else {
                    res.send('Page stats are inserted successfully');
                }
            });
        }
    });
});


module.exports = router;
