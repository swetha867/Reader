const express = require('express');
const db = require('../database/db');
const passport = require('passport');
const dic = require('../api/dictionary');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('inst/login', { page: 'Express' });
})

router.get('/students', (req, res) => {
  console.log(req.isAuthenticated());
  console.log(req.user);
  res.send(req.user);
})

module.exports = router;