
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
        dic.lookupAndSave("book").then( lookedUp => {
          console.log(`Looked up ${lookedUp}`)
          res.send('looked up');
        });
      }
  })



})
module.exports = router;