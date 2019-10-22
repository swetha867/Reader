const express = require('express');
const db = require('../database/db');
const passport = require('passport');
const dic = require('../api/dictionary');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('inst/login', { page: 'Express' });
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



// async function getAllUsers(user_id, word_id) {
//   return new Promise(function (resolve, reject) {

//   });
// }

module.exports = router;