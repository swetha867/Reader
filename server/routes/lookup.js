
const express = require('express');
const db = require('../database/db');
const dic = require('../api/dictionary');
const book = require('../database/book');
const router = express.Router();

const fs = require('fs');
//private static final Pattern END_OF_SENTENCE = Pattern.compile("\\.\\s+");


router.post('/', (req, res) => {
  handleLookup(req.body.book_name, req.body.author_name,req.body.user_id,
    req.body.word,req.body.sentence
    ).then(results => res.send(results));
  })

  

  /*
Script to generate WSD input data from koob database
  */
 router.get('/WSDInputData', (req, res) => {
    handleWSDInputData(
      ).then(results => res.send({"message":"please check the folder /tmp/WSDInputData for request jsons"}));
});
    
    
    function getWSDInputData(){
       return new Promise((resolve, reject) => {
           sql = "select v2.sentence,v2.user_id,v2.book_id,v2.paragraph,dw.word from votes v2  join dictionary_words dw where  v2.paragraph!='' and dw.id=v2.word_id and v2.user_id='4';";
           db.query(sql, function (err, result){
               if (err){
                   console.log("Garden Error: " + err);
                   reject(err);
               }
               resolve(result)
           })
       })
   }
   
    async function handleWSDInputData() {
      let output = await getWSDInputData();


      fs.mkdir('/tmp/WSDInputData', { recursive: true }, (err) => {
        if (err) throw err;
      });
      for(let i=0;i<output.length;i++){
        var book_id=output[i].book_id;
        var user_id=output[i].user_id;
        var  sentence=output[i].sentence;
        var word=output[i].word;
        var paragraph=output[i].paragraph;
        //console.log(word);
        var data=await handleLookup(book_id,user_id,word,sentence);
        var WSDInputData = {"word": word, "sentence":sentence,"paragraph":paragraph,"dictionaryData":data};
        fs.appendFile('/tmp/WSDInputData/request1.json', (JSON.stringify(WSDInputData)),'utf8', err => {
          if (err) {
            console.log('Error writing file', err)
          } else {
            console.log('Successfully wrote file')
          }  
        })

      }


    }

    async function handleLookup(book_id,user_id,word,sentence) {
      
      // async function handleLookup(book_name,author_name,user_id,word,sentence) {
      var current_version = 2; // everytime we should the dic api we should increment here as well.
      //var book_id = await book.getBookId(book_name,author_name);
      var book_id=book_id;
      var user_id = user_id;
      var sentence = sentence;
      var word = word;
      return new Promise(function (resolve, reject) {
        
        
        if (typeof word == 'undefined' || word == '') {
          resolve('No word given');
          return;
        }
        // first check if word exists in database
        db.query('SELECT * FROM dictionary_words WHERE word = ?', [word], (err, rows, fields) => {
          if (err) {
            console.log(`Here is the error ${err}`)
            resolve(`Here is the error ${err}`);
            return;
          }
          if (rows.length == 0) {
            // Word is not in database. call the Api to insert the word.
            // Need to give dynamic value ${word}
            dic.lookupAndSave(word, current_version).then(lookedUpID => {
              updateFreq(user_id, book_id, lookedUpID, sentence)
              console.log(`Looked up ${lookedUpID}`)
              lookupMeaning(user_id, lookedUpID).then(meanings => {
                console.log(meanings);
                resolve(meanings);
              });
            });
          } else { // Should go in else block once the word is already saved in db
            // check if we need to update the meanings
            if (rows[0].version < current_version) {
              dic.updateMeanings(rows[0].id, word, current_version).then(_ => {
                lookupMeaning(user_id, rows[0].id).then(meanings => {
                  resolve(meanings);
                });
              });
            } else {
              lookupMeaning(user_id, rows[0].id).then(meanings => {
                resolve(meanings);
              });
            }
            
            updateFreq(user_id, book_id, rows[0].id, sentence)
          }
        })
      });
    }
    
    
    
    
    async function lookupMeaning(user_id, word_id) {
      return new Promise(function (resolve, reject) {
        db.query('SELECT dictionary_meanings.*, COUNT(votes.id) count, MAX(isTeacher) isTeacher,  IF(users.id=?, 1, 0) isUser ' +
        'FROM dictionary_meanings LEFT JOIN votes ' +
        'ON dictionary_meanings.id = votes.meaning_id ' +
        'LEFT JOIN users ON votes.user_id = users.id ' +
        'WHERE dictionary_meanings.word_id = ? ' +
        'group by dictionary_meanings.id ' +
        'ORDER BY isTeacher DESC, count DESC ', [user_id, word_id], (err, rows, fields) => {
          if (err) {
            console.log(`Here is the error for votes table:${err}`);
            resolve(err);
          } else {
            console.log('Votes Table Information Fetched');
            resolve(rows);
          }
        })
      });
    }
    
    async function updateFreq(user_id, book_id, word_id, sentence) {
      db.query('SELECT * FROM votes WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ?', [user_id, book_id, word_id, sentence], (err, rows, fields) => {
        if (err) {
          console.log(`Here is the error ${err}`)
          return;
        }
        if (rows.length == 0) {
          // not added in the db. add for first time.
          console.log(user_id);
          console.log(book_id);
          console.log(word_id);
          console.log(sentence);
          db.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `sentence`, `updated_on`) VALUES (?,?,?,?, CURRENT_TIMESTAMP()) ',
          [user_id, book_id, word_id, sentence], (req, resp) => {
            console.log("vote details inserted!");
          }
          );
        } else { // Already exists, increment the freq
          db.query('UPDATE votes SET freq = freq + 1 WHERE id = ? ', [rows[0].id], (req, resp) => {
            console.log("freq increased!");
          }
          );
        }
      })
    }
    
    
    module.exports = router;