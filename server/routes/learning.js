
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const router = express.Router();

router.post('/', (req, res) => {
  var user_id = req.body.user_id;

  db.query(`SELECT word, meaning, books.book_name, books.author_name, sentence, freq, updated_on,

  (SELECT meaning from votes v2, users u2, dictionary_meanings m2 
    WHERE v2.user_id = u2.id 
    AND u2.isTeacher = 1 
    AND v2.book_id = v1.book_id 
    AND v2.word_id = v1.word_id 
    AND v2.sentence = v1.sentence 
    AND m2.id = v2.meaning_id
    LIMIT 0,1) meaning_teacher
    
  FROM votes v1 
  JOIN books ON book_id = books.id
  JOIN dictionary_words ON word_id = dictionary_words.id
  LEFT OUTER JOIN dictionary_meanings ON meaning_id = dictionary_meanings.id
  WHERE user_id = ?
  /* HAVING meaning <>  meaning_teacher */
  ORDER BY updated_on DESC`, [user_id], (err, rows, fields) => {
    if (err) {
      console.log(`Here is the error ${err}`)
      res.send(`Here is the error ${err}`);
      return;
    }
    res.send(rows);
    return;
  })
})

module.exports = router;