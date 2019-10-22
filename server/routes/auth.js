const express = require('express');
const request = require('request');
const passport = require('passport');
const { User } = require('../model/user.js');

const authRouter = express.Router();



authRouter.route('/login')
  .get((req, res) => {
    res.render('auth/login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/auth/success/',
    failureRedirect: '/auth/login/failed',
    failureFlash: false,
  }));


authRouter.route('/login/failed')
  .get((req, res) => {
    res.render('auth/login', { loginError: true });
  });

authRouter.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
  });


  authRouter.route('/success')
  .get((req, res) => {
    res.send(req.body.user);
  });

module.exports = authRouter;