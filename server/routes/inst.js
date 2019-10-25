const express = require('express');
const db = require('../database/db');
const passport = require('passport');
const dic = require('../api/dictionary');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('inst/index');
})

router.get('/students', (req, res) => {
  getStudents(req, res);
})

async function getStudents(req, res){
  db.query('SELECT * FROM users', [], (err, rows, fields) => {
    if (err) {
      res.send(err);
    }else{
      res.render('inst/students', { students: rows});
    }
  })
}

router.post('/vote', (req, res) => {
  postVote(req, res);
})

async function postVote(req, res){
  var vote_id = req.body.vote_id;
  var meaning_id = req.body.meaning_id;

  db.query(`INSERT INTO votes (user_id, book_id, word_id, meaning_id, sentence, freq, updated_on)
  SELECT  ?, book_id, word_id, ?, sentence, 1, CURRENT_TIMESTAMP() FROM votes v2 WHERE v2.id = ? `,
   [req.user.id, meaning_id, vote_id], (err, rows, fields) => {
    if (err) {
      res.send(err);
    }else{
      res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id});
    }
  });
}


router.get('/vote', (req, res) => {
  getVote(req, res);
})

async function getVote(req, res){
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getVotesForBook(books[i].id);
  }
  console.log('rendering');
  res.render('inst/vote', { books: books});
}


async function getAllBooks() {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT * FROM books ORDER BY book_name`, [],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }else{
        resolve(rows);
        return;
      }
    })
  });
}

async function getVotesForBook(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.id vote_id, v.word_id, word, sentence,
    GROUP_CONCAT(CONCAT('{"id":"', dm.id, '", "fl":"',dm.fl,'", "meaning":"',dm.meaning,'"}')) meanings
    FROM votes v 
    JOIN dictionary_meanings dm ON v.word_id = dm.word_id
    JOIN dictionary_words dw ON dw.id = dm.word_id
    WHERE v.meaning_id = 0 
    AND v.book_id = ?
    GROUP BY v.word_id;`, [book_id],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }else{
        resolve(rows);
        return;
      }
    })
  });
}

module.exports = router;