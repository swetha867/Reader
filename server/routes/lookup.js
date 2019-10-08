
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const router = express.Router();

router.post('/', (req, res) => {

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
      dic.lookupAndSave(word).then(lookedUp => {
        console.log(`Looked up ${lookedUp}`)
        lookupMeaning(lookedUp).then(meanings => {
          console.log(meanings);
          res.send(meanings);
        });
      });
    } else { // Should go in else block once the word is already saved in db
      lookupMeaning(rows[0].id).then(meanings => {
        console.log(meanings);
        res.send(meanings);
      });
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


module.exports = router;