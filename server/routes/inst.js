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


router.get('/vote', (req, res) => {
  getVote(req, res);
})

async function getVote(req, res){
  db.query(`SELECT word, sentence,
  GROUP_CONCAT(CONCAT('{"id":"', dm.id, '", "fl":"',dm.fl,'", "meaning":"',dm.meaning,'"}')) meanings
  FROM votes v 
  JOIN dictionary_meanings dm ON v.word_id = dm.word_id
  JOIN dictionary_words dw ON dw.id = dm.word_id
  WHERE v.meaning_id = 0 GROUP BY v.word_id;`, [],
  (err, rows, fields) => {
    if (err) {
      res.send(err);
    }else{
      res.render('inst/vote', { votes: rows});
    }
  })

}


// async function getAllUsers(user_id, word_id) {
//   return new Promise(function (resolve, reject) {

//   });
// }

module.exports = router;