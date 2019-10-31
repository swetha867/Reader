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

  // check if exists
  var existing_id = await getVoteId(vote_id, req.user.id);
  if(existing_id > 0){ // update
    db.query(`UPDATE votes SET meaning_id = ? WHERE id = ?`,
     [meaning_id, existing_id], (err, rows, fields) => {
      if (err) {
        res.send(err);
      }else{
        res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id});
      }
    });
  }else{ // insert
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
}


async function getVoteId(vote_id, user_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v1.id FROM votes v1 JOIN votes v2
    ON v1.book_id = v2.book_id
    AND v1.word_id = v2.word_id
    AND v1.sentence = v2.sentence
    WHERE v2.id = ?
    AND v1.user_id = 2`, [vote_id, user_id], (err, rows, fields) => {
        if (err) {
          console.log(`Here is the error for votes table:${err}`);
          resolve(-1);
          return;
        }
        if(rows.length == 0){
          resolve(0);
          return;
        }
        resolve(rows[0].id);
      })
  });
}


/**
 * GET /vote
 * Words that the instructor still needs to vote
 */
router.get('/vote', (req, res) => {
  getVote(req, res);
})

async function getVote(req, res){
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getPendingVotesForBook(books[i].id);
  }
  res.render('inst/vote', { books: books});
}


/**
 * GET /votes
 * History of instructor votes
 */
router.get('/votes', (req, res) => {
  getVotes(req, res);
})

async function getVotes(req, res){
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getVotesForBook(req.user.id, books[i].id);
  }
  res.render('inst/votes', { books: books});
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


async function getVotesForBook(user_id, book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.id vote_id, v.word_id, word, sentence, meaning_id,
    GROUP_CONCAT(CONCAT('{"id":"', dm.id, '", "fl":"',dm.fl,'", "meaning":"',dm.meaning,'"}')) meanings
    FROM votes v 
    JOIN dictionary_meanings dm ON v.word_id = dm.word_id
    JOIN dictionary_words dw ON dw.id = dm.word_id
    WHERE v.user_id = ?
    AND v.book_id = ?
    AND meaning_id != 0 AND meaning_id IS NOT NULL
    GROUP BY v.word_id;`, [user_id, book_id],
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

async function getPendingVotesForBook(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.id vote_id, v.word_id, word, sentence,
    GROUP_CONCAT(CONCAT('{"id":"', dm.id, '", "fl":"',dm.fl,'", "meaning":"',dm.meaning,'"}')) meanings,
    (SELECT meaning_id FROM votes vt JOIN users vu ON vt.user_id = vu.id WHERE vu.isTeacher = 1 AND v.word_id = vt.word_id AND v.sentence = vt.sentence AND v.book_id = vt.book_id ORDER BY meaning_id DESC LIMIT 0,1) meaning_teacher
    FROM votes v 
    JOIN dictionary_meanings dm ON v.word_id = dm.word_id
    JOIN dictionary_words dw ON dw.id = dm.word_id
    WHERE v.meaning_id = 0 
    AND v.book_id = ?
    GROUP BY v.word_id
    HAVING meaning_teacher IS NULL;`, [book_id],
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