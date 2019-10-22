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
    if(!req.isAuthenticated()){
      res.redirect('/auth/login');
      return;
    }
    if(req.user.isTeacher === 1){
      res.redirect('/instructor/students');
    }else{
      res.redirect('/dash');
    }
  });

module.exports = authRouter;