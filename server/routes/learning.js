
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const router = express.Router();

router.post('/', (req, res) => {
  var user_id = req.body.user_id;
  var book_id = req.body.book_id;
  book_id = 1; // it was undefined.. we need to have it pulled from db
  var sentence = req.body.sentence;
  var word = req.body.word;
  if (typeof word == 'undefined' || word == '') {
    res.send('No word given');
    return;
  }
  // first check if word exists in database
  db.query('SELECT * FROM dictionary_words WHERE word = ?', [word], (err, rows, fields) => {
    if (err) {
      console.log(`Here is the error ${err}`)
      res.send(`Here is the error ${err}`);
      return;
    }
    if (rows.length == 0) {
      // Word is not in database. call the Api to insert the word.
      // Need to give dynamic value ${word}
      dic.lookupAndSave(word).then(lookedUpID => {
        updateFreq(user_id, book_id, lookedUpID, sentence)
        console.log(`Looked up ${lookedUpID}`)
        lookupMeaning(lookedUpID).then(meanings => {
          console.log(meanings);
          res.send(meanings);
        });
      });
    } else { // Should go in else block once the word is already saved in db
      lookupMeaning(rows[0].id).then(meanings => {
        console.log(meanings);
        res.send(meanings);
      });
      updateFreq(user_id, book_id, rows[0].id, sentence)
    }
  })
})


async function lookupMeaning(word_id) {
  return new Promise(function (resolve, reject) {
    db.query('SELECT dictionary_meanings.*, COUNT(votes.id) count, MAX(isTeacher) isTeacher ' +
      'FROM dictionary_meanings LEFT JOIN votes ' +
      'ON dictionary_meanings.id = votes.meaning_id ' +
      'LEFT JOIN users ON votes.user_id = users.id ' +
      'WHERE dictionary_meanings.word_id = ? ' +
      'group by dictionary_meanings.id', [word_id], (err, rows, fields) => {
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
      db.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `sentence`) VALUES (?,?,?,?) ',
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