const express = require('express');
const db = require('../database/db');
const https = require('https');

var dic = {
  lookupAndSave: async function(word){
    var meanings = await this.lookup(word);
    var dbRes = await this.save(word, meanings);

    return new Promise(function(resolve, reject) {
      resolve(dbRes);
    });
  },

  save: async function(word, meanings){
    
    return new Promise(function(resolve, reject) {
      db.query('INSERT INTO dictionary_words (`word`) VALUES (?) ', 
      [word], (req,resp) => {
        var word_id = resp.insertId;

        meanings.forEach(meaning => {
          db.query('INSERT INTO dictionary_meanings (`word_id`,`fl`,`meaning`) VALUES (?,?,?) ', 
          [word_id, meaning.fl, meaning.shortdef[0]], (req,resp) => { });
        })

        resolve(word_id);
      });
    });
  },

  lookup: async function(word){
    return new Promise(function(resolve, reject) {
      https.get(
        {
          host: 'www.dictionaryapi.com',
          path: '/api/v3/references/learners/json/' + word + '?key=44e0ef0b-a516-4c4d-8fff-12be8779749b'
      },(resp) => {

        var data = '';
        resp.on('data', function(d) {
            data += d;
        });
        resp.on('end', () => {
          var results = JSON.parse(data);
          // console.log(results);
          resolve(results) // successfully fill promise
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        resolve("error") // successfully fill promise
      });
      console.log("looking up");
    })
  }
}

module.exports = dic;