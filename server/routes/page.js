const express = require('express');
const db = require('../database/db');
const book = require('../database/book');
const { Reading } = require('../model/reading');
var moment = require('moment');
const router = express.Router();

router.get('/', (req, res) => {
    db.query('Select * from PageTable', (err, rows, field) => {
        if (err) {
            res.send('Error fetching from the Page Table', err);
        }
        else {
            res.send(rows);
        }
    });
});

router.post('/statistics', (req, res) => {
    var userID = req.body.userID;
    var book_name = req.body.book_name;
    var author_name = req.body.author_name;

    db.query('Select id from books where book_name=? and author_name=?;', [book_name, author_name], (err, result, fields) => {
        if (err) {
            res.send('error in selecting book id for stats call', err);
        }
        if (result.length === 0) {
            res.send('Book not in the database');
        }
        else {
            db.query('Select * from PageTable where user_id=? and book_id=?;', [userID, result[0].id], (err, result, fields) => {
                if (err) {
                    res.send('Error getting page stats for book', err);
                }
                else {
                    res.send(result);
                }
            })
        }
    })
})

router.post('/', (req, res) => {
    handlePostPage(req).then(results => res.send(results));
});

async function handlePostPage(req) {
    var bookID = await book.getBookId(req.body.book_name, req.body.author_name);
    var userID = parseInt(req.body.userID);
    var page_number = parseInt(req.body.page_number);
    var seconds = parseInt(req.body.seconds);
    var font_size = req.body.font_size;
    var end = moment().format('YYYY-MM-DD HH:mm:ss');

    return handlePostPageHelper(bookID, userID, page_number, seconds, font_size, end)
}


async function handlePostPageHelper(bookID, userID, page_number, seconds, font_size, end) {
    var start = moment(end).subtract(seconds, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    var session = await Reading.getSessionId(userID, start, page_number);

    return new Promise(function (resolve, reject) {
        if (seconds < 1 || seconds > 600) {
            resolve({ res: 'Invalid seconds range' });
            return;
        }

        if (!bookID || bookID == NaN || userID == NaN || page_number == NaN || seconds == NaN) {
            resolve({ res: 'Invalid inputs.' });
            return;
        }

        db.query('INSERT INTO readings (`user_id`,`book_id`,`page_number`,`seconds`,`font_size`, `start`, `end`, `session`) VALUES (?,?,?,?,?,?,?,?);',
            [userID, bookID, page_number, seconds, font_size, start, end, session], (err, result, fields) => {
                if (err) {
                    resolve({ res: 'Error in inserting the page statistics' });
                    return;
                }
                resolve({ res: 'Page stats are inserted successfully' });
            });
    });
}



router.get('/reload', (req, res) => {
    handleReload().then(results => res.send(results));
});

async function handleReload() {
    return new Promise(function (resolve, reject) {

        db.query('SELECT * FROM PageTable ORDER BY id ASC', (err, rows, fields) => {
            if (err) {
                resolve({ res: 'DB error.' });
                return;
            }
            (async function (rows) {
                for (i = 0; i < rows.length; i++) {
                    var end = moment(rows[i].timestamp).format('YYYY-MM-DD HH:mm:ss');
                    await handlePostPageHelper(rows[i].book_id, rows[i].user_id, rows[i].page_number, rows[i].seconds, rows[i].font_size, end);
                }

                resolve({ res: rows.length + ' rows inserted.' });
            })(rows)
        })
    });
}

module.exports = router;
