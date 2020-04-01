
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const book = require('../database/book');
const router = express.Router();

router.post('/', (req, res) => {
  handleLookup(req).then(results => res.send(results));
})

async function handleLookup(req) {
  var book_id = await book.getBookId(req.body.book_name, req.body.author_name);
  var user_id = req.body.user_id;
  var sentence = req.body.sentence;
  var word = req.body.word;

  return new Promise(function (resolve, reject) {


    if (typeof word == 'undefined' || word == '') {
      resolve('No word given');
      return;
    }
    // first check if word exists in database
    db.query('SELECT * FROM dictionary_words WHERE word = ?', [word], (err, rows, fields) => {
      if (err) {
        console.log(`Here is the error ${err}`)
        resolve(`Here is the error ${err}`);
        return;
      }
      if (rows.length == 0) {
        // Word is not in database. call the Api to insert the word.
        // Need to give dynamic value ${word}
        dic.lookupAndSave(word).then(lookedUpID => {
          updateFreq(user_id, book_id, lookedUpID, sentence)
          console.log(`Looked up ${lookedUpID}`)
          lookupMeaning(user_id, lookedUpID).then(meanings => {
            console.log(meanings);
            resolve(meanings);
          });
        });
      } else { // Should go in else block once the word is already saved in db
        lookupMeaning(user_id, rows[0].id).then(meanings => {
          console.log(meanings);
          resolve(meanings);
        });
        updateFreq(user_id, book_id, rows[0].id, sentence)
      }
    })
  });
}




async function lookupMeaning(user_id, word_id) {
  return new Promise(function (resolve, reject) {
    db.query('SELECT dictionary_meanings.*, COUNT(votes.id) count, MAX(isTeacher) isTeacher,  IF(users.id=?, 1, 0) isUser ' +
      'FROM dictionary_meanings LEFT JOIN votes ' +
      'ON dictionary_meanings.id = votes.meaning_id ' +
      'LEFT JOIN users ON votes.user_id = users.id ' +
      'WHERE dictionary_meanings.word_id = ? ' +
      'group by dictionary_meanings.id ' + 
      'ORDER BY isTeacher DESC, count DESC ', [user_id, word_id], (err, rows, fields) => {
        if (err) {
          console.log(`Here is the error for votes table:${err}`);
          resolve(err);
        }else{
          console.log('Votes Table Information Fetched');
          resolve(rows);
        }
      })
  });
}

async function updateFreq(user_id, book_id, word_id, sentence) {
  db.query('SELECT * FROM votes WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ?', [user_id, book_id, word_id, sentence], (err, rows, fields) => {
    if (err) {
      console.log(`Here is the error ${err}`)
      return;
    }
    if (rows.length == 0) {
      // not added in the db. add for first time.
      console.log(user_id);
      console.log(book_id);
      console.log(word_id);
      console.log(sentence);
      db.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `sentence`, `updated_on`) VALUES (?,?,?,?, CURRENT_TIMESTAMP()) ',
      [user_id, book_id, word_id, sentence], (req,resp) => {
          console.log("vote details inserted!");
      }
      );
    } else { // Already exists, increment the freq
      db.query('UPDATE votes SET freq = freq + 1 WHERE id = ? ', [rows[0].id], (req,resp) => {
          console.log("freq increased!");
      }
      );
    }
  })
}


module.exports = router;