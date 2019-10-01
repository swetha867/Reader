
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const router = express.Router();

router.post('/', (req,res) => {

    var word = req.body.word;
    // first check if word exists in database
    db.query('SELECT * FROM dictionary_words WHERE word = ?', [word], (err,rows,fields) => {
      if (err) {
        console.log(`Here is the error ${err}`)
        res.send(`Here is the error ${err}`);
        return;
      }
      if(rows.length == 0){
        // Word is not in database. call the Api to insert the word.
        // Need to give dynamic value ${word}
        dic.lookupAndSave(word).then( lookedUp => {
          console.log(`Looked up ${lookedUp}`)
          res.send('looked up');
        });
      }
      // Should go in else block once the word is already saved in db
      else {
        db.query('SELECT dictionary_meanings.*, COUNT(votes.id) count ' +
        'FROM dictionary_meanings LEFT JOIN votes ' +
        'ON dictionary_meanings.id = votes.meaning_id ' +
        'WHERE dictionary_meanings.word_id=1 ' +
        'group by dictionary_meanings.id', (err,rows,fields) => {
          if (!err){
          res.send(rows);
          console.log('Votes Table Information Fetched');
          }
          else {
            console.log(`Here is the error for votes table:${err}`);
          }
        })
      }
  })
})


module.exports = router;