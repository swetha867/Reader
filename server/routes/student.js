const express = require('express');
const db = require('../database/db');
const router = express.Router(); 
const user = require('../model/user');

router.get('/:id', (req,res) => {

    // res.send('New surveys are not being accepted at this time.');
    // return;

    var id  = req.params.id;
    //timestamp = req.body.timestamp; date.now()
    db.query(`Select word from dictionary_words JOIN votes ON votes.word_id = dictionary_words.id and votes.user_id = ${id} and votes.updated_on >= '2019-11-8'`, (err,rows,fields) => {
        if (err) {
            res.send(`Error in getting words for the user ${id}: ${err}`);
        }
        else {
            res.render('../views/student-survey/index.ejs', {wordsList : rows, id}  );
        }
    });
});

router.post('/:id/survey', (req,res) => {
    // res.send('New surveys are not being accepted at this time.');
    // return;
    
    var id = req.params.id;
    console.log('RESPONSE', req.body);
    var lookedUpWordCount = 0;
    var skippedWordCount = 0;
    var imageWordsCount = 0;
    var imageWordsSupport = [];
    var votesWordCount = 0;
    var voteWordsSupport = [];
    var lookedupWords = [];
    var skippedWords= [];
    var answer_4, answer_5, answer_6, answer_7,answer_8;
    for (var i in req.body) {
        let question_num = i.split(':')[0];
        let wordName = i.split(':')[1];
        if (question_num === 'Q1') {
            if (req.body[i] === 'Lookedup') {
                lookedUpWordCount++;
                lookedupWords.push(wordName);
            }
            else if (req.body[i] === 'Skip') {
                skippedWordCount++;
                skippedWords.push(wordName);
            }
        }
        if (question_num === 'Q2') {
            imageWordsSupport.push(req.body[i]);
            imageWordsCount++;
        }
        if (question_num === 'Q3') {
            voteWordsSupport.push(req.body[i]);
            votesWordCount++;
        }
        if (question_num === 'Q4') {
            answer_4 = req.body[i];
        }
        if (question_num === 'Q5') {
            answer_5 = req.body[i];
        }
        if (question_num === 'Q6') {
            answer_6 = req.body[i];
        }
        if (question_num === 'Q7') {
            answer_7 = req.body[i];
        }
        if (question_num === 'Q8') {
            answer_8 = req.body[i];
        }
    }
    // Inserting in the survey2 table
    
    var total_count = lookedUpWordCount + skippedWordCount;
    db.query('Insert into survey2 (user_id,total_count,q1_skip_count,q1_skip_words,q1_lookup_count,q1_lookup_words,q2_image_count,q2_image_words,q3_vote_count,q3_vote_words,q4_help_support,q5_support,q6_feedback,q7_feedback,q8_feedback,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP);',
    [id,total_count,skippedWordCount,`${skippedWords}`,lookedUpWordCount,`${lookedupWords}`,imageWordsCount,`${imageWordsSupport}`,votesWordCount,`${voteWordsSupport}`,answer_4,answer_5,answer_6,answer_7,answer_8], (err,result,fields) => {

        if (err) {
            res.send(`Error in storing the survey in db:${err}`);
        }
        else {
            res.send('Thank you for your feedback. :)');
        }
    });
})


module.exports = router;
