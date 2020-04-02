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
          if(typeof meaning.shortdef != 'undefined' && meaning.shortdef.length > 0 ){
            db.query('INSERT INTO dictionary_meanings (`word_id`,`fl`,`meaning`) VALUES (?,?,?) ', 
            [word_id, meaning.fl, meaning.shortdef[0]], (req,resp) => { });
          }
        })
        resolve(word_id);
      });
    });
  },

  lookup: async function(word){
    return new Promise(function(resolve, reject) {
      https.get(
        {
          // previous api http://www.dictionaryapi.com/api/v3/references/learners/json/semiliterate?key=44e0ef0b-a516-4c4d-8fff-12be8779749b
          host: 'www.dictionaryapi.com',
          // new api for school 
          // MERRIAM-WEBSTER'S SCHOOL DICTIONARY WITH AUDIO (GRADES 9-11)
          path: '/api/v3/references/sd4/json/' + encodeURI(word) + '?key=6f248551-51e6-44d3-b34e-0576482cc014'
      },(resp) => {

        var data = '';
        resp.on('data', function(d) {
            console.log(d);
            data += d;
        });
        resp.on('end', () => {
          var results = JSON.parse(data);
          console.log(results);
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