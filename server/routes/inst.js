
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('inst/login', { page: 'Express' });
})

module.exports = router;