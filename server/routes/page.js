const express = require('express');
const mysqlConnection = require('../database/db');
const router = express.Router();


router.get('/', (req,res) => {
    mysqlConnection.query('Select * from PageTable', (err,rows,field) => {
        if (err) {
            res.send('Error fetching from the Page Table',err);
        }
        else {
        res.send(rows);
        }
    });
});
var bookID;

router.post('/statistics', (req,res) => {
    var userID = req.body.userID;
    var book_name = req.body.book_name;
    var author_name = req.body.author_name;

    mysqlConnection.query('Select id from books where book_name=? and author_name=?;', [book_name,author_name], (err,result,fields) => {
        if (err) {
            res.send('error in selecting book id for stats call',err);
        }
        if (result.length === 0) {
            res.send('Book not in the database');
        }
        else {
            console.log(result[0].id);
            mysqlConnection.query('Select * from PageTable where user_id=? and book_id=?;',[userID,result[0].id], (err,result,fields) => {
                if (err) {
                    res.send('Error getting page stats for book',err);
                }
                else {
                    res.send(result);
                }
            })
        }
    })
})

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
                mysqlConnection.query(`Select id from PageTable where user_id=? and book_id=? and page_number=?`,[userID,bookID,page_number], (err,result,fields) => {
                    if (err) {
                        res.send('Error getting id from pagetable', err);
                    }
                    if (result.length !== 0) {
                        mysqlConnection.query('Insert into PageTable (`user_id`,`book_id`,`page_number`,`seconds`) VALUES (?,?,?,?);', [userID, bookID, page_number, seconds], (err, result, fields) => {
                            if (err) {
                                res.send('Error in inserting the page statistics', err);
                            }
                            else {
                                res.send('Page stats are inserted successfully');
                            }
                        });
                    }
                    else if (result.length === 0) {
                        mysqlConnection.query(`Update PageTable set seconds=seconds + ${seconds}`, (err,result,fields) => {
                            if (err) {
                                res.send(`Error in updating the Page Table seconds with ${err}`);
                            }
                            res.send(result);
                        })
                    }
                })
            });
        }
        else if (result.length !== 0) {
            bookID = result[0].id;
            mysqlConnection.query(`Select id from PageTable where user_id=? and book_id=? and page_number=?`,[userID,bookID,page_number], (err,result,fields) => {
                if (err) {
                    res.send('Error getting id from pagetable', err);
                }
                if (result.length === 0) {
                    mysqlConnection.query('Insert into PageTable (`user_id`,`book_id`,`page_number`,`seconds`) VALUES (?,?,?,?);', [userID, bookID, page_number, seconds], (err, result, fields) => {
                        if (err) {
                            res.send('Error in inserting the page statistics', err);
                        }
                        else {
                            res.send('Page stats are inserted successfully');
                        }
                    });
                }
                else if (result.length !== 0) {
                    var id = result[0].id;
                    mysqlConnection.query(`Update PageTable set seconds = seconds + ${seconds} where id = ${id} `, (err,result,fields) => {
                        if (err) {
                            res.send(`Error in updating the Page Table seconds with ${err}`);
                        }
                        res.send('Seconds updated');
                    })
                }
            });
        }
    });
});


module.exports = router;
