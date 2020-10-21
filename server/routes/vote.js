
const express = require('express');
const db = require('../database/db');
const book = require('../database/book');
const router = express.Router();

// For now GET call is to see the data on postman
router.get('/', (req, res) => {
    mysqlConnection.query('Select * from votes', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
            console.log('Information from Votes Table Fetched');
        } else {
            res.send(`Error fetching the voting details: ${err}`);
        }
    })
});

// POST call to enter the information in votes Table
// Meaning id 0 means student is not sure which meaning is selected
// When student lookup for word anytime, we should recieve a post request here with meaningId as null
router.post('/', (req, res) => {
    handleVote(req).then(results => res.send(results));
});


router.post('/getUserVotes', (req, res) => {
    getVotes(req).then(results => res.send(results));
});

async function getVotes(req) {
    var bookID = await book.getBookId(req.body.book_name, req.body.author_name);
    var userID = req.body.user_id;
   // var wordID = req.body.word_id;
   // var meaningID = req.body.meaning_id;
    var sentence = req.body.sentence;
console.log(bookID);
    return new Promise(function (resolve, reject) {

      db.query('SELECT votes.meaning_id FROM votes WHERE user_id = ? AND book_id = ?  AND sentence = ?',
      [userID, bookID, sentence], (err, rows, fields) => {
            if (err) {
              console.log(`Here is the error for votes table:${err}`);
              resolve(err);
            } else {
              console.log('Votes Table Information Fetched for particular userId , bookid and sentence');
              resolve(rows);
            }
          })
        })
    
       

}

async function handleVote(req) {

    var bookID = await book.getBookId(req.body.book_name, req.body.author_name);
    var userID = req.body.user_id;
    var wordID = req.body.word_id;
    var meaningID = req.body.meaning_id;
    var sentence = req.body.sentence;
    var paragraph=req.body.paragraph;
    console.log(bookID);

    return new Promise(function (resolve, reject) {

        if (wordID == "") {
            resolve({ res: 'error' });
            return;
        }
        
        console.log('SELECT * FROM votes WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ?');
        console.log([userID, bookID, wordID, sentence]);

        db.query('SELECT * FROM votes WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ?',
            [userID, bookID, wordID, sentence], (err, rows, fields) => {
                if (err) {
                    console.log(`Here is the error ${err}`)
                    resolve({ res: `Error: ${err}` });
                    return;
                }
                console.log('length ' +rows.length);
                if (rows.length == 0) {
                    // Storing all the attributes in votes table with book id
                    db.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `meaning_id`, `sentence`,`paragraph`) VALUES (?,?,?,?,?) ',
                        [userID, bookID, wordID, meaningID, sentence,paragraph], (err, rows, fields) => {
                            if (err) {
                                console.log(`Here is the error ${err}`)
                                resolve({ res: `Error: ${err}` });
                                return;
                            }
                            console.log("vote details inserted!");
                            resolve({ response: "Vote Details Inserted!" });
                        });
                } else {
                    // Storing all the attributes in votes table with book id
                    db.query('UPDATE votes SET meaning_id = ?, paragraph=? WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ? ',
                        [meaningID,paragraph, userID, bookID, wordID, sentence], (err, rows, fields) => {
                            if (err) {
                                console.log(`Here is the error ${err}`)
                                resolve({ res: `Error: ${err}` });
                                return;
                            }
                            console.log('length ' +rows);
                            console.log("vote details updated!");
                            resolve({ response: "Vote Details updated!" });
                        });
                }
            });
    });
}



// save a new custom definition only by the teacher
// TODO: make sure the user is the teacher
router.post('/custom', (req, res) => {
    handleCustom(req).then(results => res.send(results));
});

async function handleCustom(req) {
    // Used in handleVote:
    // var bookID = await book.getBookId(req.body.book_name, req.body.author_name);
    // var userID = req.body.user_id;
    // var sentence = req.body.sentence;
    var wordId = await getWordId(req.body.word);
    var def = req.body.def;
    var fl = req.body.fl;

    if (wordId == 0 || !def || def == "" || !fl || fl == "") {
        return ({ res: 'error' });
    }

    // insert the new meaning and set it on request
    req.body.word_id = wordId;
    req.body.meaning_id = await insertNewMeaning(wordId, def, fl);
    if (req.body.meaning_id == 0) {
        return ({ res: 'error' });
    }
    return handleVote(req);
}


async function getWordId(word) {
    return new Promise(function (resolve, reject) {
        db.query('SELECT * FROM dictionary_words WHERE word = ?', [word], (err, rows, fields) => {
            if (err || rows.length != 1) {
                resolve(0);
                return;
            }
            resolve(rows[0].id);
        });
    });
}

async function insertNewMeaning(word_id, def, fl) {
    return new Promise(function (resolve, reject) {
        db.query('INSERT INTO dictionary_meanings (`word_id`,`fl`,`meaning`) VALUES (?,?,?) ',
            [word_id, fl, def], (err, rows, fields) => {
                if (err) {
                    resolve(0);
                }
                resolve(rows.insertId);
            });
    });
}



router.post('/getAllForHighlight', (req, res) => {
    handleGetAllForHighlight(req).then(results => res.send(results));
});

async function handleGetAllForHighlight(req) {
    var bookID = await book.getBookId(req.body.book_name, req.body.author_name);
    var userID = req.body.user_id;
    var words = await getAllLookedup(bookID, userID)
    return { res: 'success', words: words };
}

async function getAllLookedup(bookID, userID) {
    return new Promise(function (resolve, reject) {
        db.query('SELECT DISTINCT(word) FROM votes JOIN dictionary_words ON \
        word_id = dictionary_words.id WHERE book_id = ? AND user_id = ?', [bookID, userID], (err, rows, fields) => {
            if (err) {
                resolve([]);
                return;
            }
            var arr = []
            rows.forEach(element => {
                arr.push(element.word);
            });
            resolve(arr);
        });
    });
}

module.exports = router;