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
});

async function getStudents(req, res){
  db.query('SELECT * FROM users', [], (err, rows, fields) => {
    if (err) {
      res.send(err);
    }
    else {
      res.render('inst/students', { students: rows});
    }
  })
}

router.post('/vote', (req, res) => {
  postVote(req, res);
})

async function postVote(req, res){
  var vote_id = req.body.vote_id;
  var meaning_id = req.body.meaning_id;

  var vote = (await getVoteById(req.body.vote_id))[0];

  if(vote == null){
    console.log("vote was not found.");
    res.send("vote was not found.");
    return;
  }

  console.log(vote);

  db.query('SELECT * FROM votes WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ?',
  [req.user.id, vote.book_id, vote.word_id, vote.sentence], (err, rows, fields) => {
      if (err) {
          console.log(`Error line 47: ${err}`)
          res.send(`Here is the error ${err}`);
          return;
      }
      if (rows.length == 0) {
          // Storing all the attributes in votes table with book id
          db.query('INSERT INTO votes (`user_id`, `book_id`, `word_id`, `meaning_id`, `sentence`) VALUES (?,?,?,?,?) ',
              [req.user.id, vote.book_id, vote.word_id, vote.meaning_id, vote.sentence], (err, rows, fields) => {
                  if (err) {
                      console.log(`Error line 56: ${err}`)
                      res.send(`Here is the error ${err}`);
                      return;
                  }
                  console.log("vote details inserted!");
                  res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id});
              });
      } else {
          // Storing all the attributes in votes table with book id
          db.query('UPDATE votes SET meaning_id = ? WHERE user_id = ? AND book_id = ? AND word_id = ? AND sentence = ?',
              [meaning_id, req.user.id, vote.book_id, vote.word_id, vote.sentence], (err, rows, fields) => {
                  if (err) {
                      console.log(`Error line 68: ${err}`)
                      res.send(`Here is the error ${err}`);
                      return;
                  }
                  console.log("vote details updated!");
                  res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id});
              });
      }
  });


  // db.query(`INSERT INTO votes (user_id, book_id, word_id, meaning_id, sentence, freq, updated_on)
  // SELECT  ?, book_id, word_id, ?, sentence, 1, CURRENT_TIMESTAMP() FROM votes v2 WHERE v2.id = ? `,
  //  [req.user.id, meaning_id, vote_id], (err, rows, fields) => {
  //   if (err) {
  //     res.send(err);
  //   }
  //   else{
  //     res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id});
  //   }
  // });
}


/**
 * GET /vote
 * Words that the instructor still needs to vote
 */
router.get('/vote', (req, res) => {
  getVote(req, res);
})

async function getVote(req, res){
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getPendingVotesForBook(books[i].id);
  }
  res.render('inst/vote', { books: books});
}


/**
 * GET /votes
 * History of instructor votes
 */
router.get('/votes', (req, res) => {
  getVotes(req, res);
})

async function getVotes(req, res){
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getVotesForBook(req.user.id, books[i].id);
  }
  console.log(books);
  res.render('inst/votes', { books: books});
}


async function getAllBooks() {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT * FROM books ORDER BY book_name`, [],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }
      else {
        resolve(rows);
        return;
      }
    })
  });
}

async function getVoteById(vote_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT * FROM votes WHERE id = ?`, [vote_id],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }
      else {
        resolve(rows);
        return;
      }
    })
  });
}

async function getVotesForBook(user_id, book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.id vote_id, v.word_id, word, sentence, meaning_id,
    GROUP_CONCAT(CONCAT('{"id":"', dm.id, '", "fl":"',dm.fl,'", "meaning":"',dm.meaning,'"}')) meanings
    FROM votes v 
    JOIN dictionary_meanings dm ON v.word_id = dm.word_id
    JOIN dictionary_words dw ON dw.id = dm.word_id
    WHERE v.user_id = ?
    AND v.book_id = ?
    AND meaning_id != 0 AND meaning_id IS NOT NULL
    GROUP BY v.word_id;`, [user_id, book_id],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }else{
        resolve(rows);
        return;
      }
    })
  });
}

async function getPendingVotesForBook(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.id vote_id, v.word_id, word, sentence,
    GROUP_CONCAT(CONCAT('{"id":"', dm.id, '", "fl":"',dm.fl,'", "meaning":"',dm.meaning,'"}')) meanings,
    (SELECT meaning_id FROM votes vt JOIN users vu ON vt.user_id = vu.id WHERE vu.isTeacher = 1 AND v.word_id = vt.word_id AND v.sentence = vt.sentence AND v.book_id = vt.book_id ORDER BY meaning_id DESC LIMIT 0,1) meaning_teacher
    FROM votes v 
    JOIN dictionary_meanings dm ON v.word_id = dm.word_id
    JOIN dictionary_words dw ON dw.id = dm.word_id
    WHERE v.meaning_id = 0 
    AND v.book_id = ?
    GROUP BY v.word_id
    HAVING meaning_teacher IS NULL;`, [book_id],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }else{
        resolve(rows);
        return;
      }
    })
  });
}

/**
 * GET /students
 * List of all students
 */
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


/**
 * GET /student
 * History of instructor votes
 */
router.get('/student/voted/:userId', (req, res) => {
  getStudentVoted(req, res);
})

async function getStudentVoted(req, res){
  const votes = await getStudentVotes(req.params.userId);
  res.render('inst/student', {user_id: req.params.userId, votes: votes, title: 'Voted words'});
}

async function getStudentVotes(student_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.word_id, book_name, word, sentence, meaning, updated_on
    FROM votes v 
    JOIN books b ON v.book_id = b.id
    JOIN dictionary_meanings dm ON v.word_id = dm.word_id AND v.meaning_id = dm.id
    JOIN dictionary_words dw ON dw.id = v.word_id
    WHERE v.user_id = ?
    GROUP BY v.word_id;`, [student_id],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }
      else {
        resolve(rows);
        return;
      }
    })
  });
}





/**
 * GET /student/lookedup
 */
router.get('/student/lookedup/:userId', (req, res) => {
  getStudentLookedUp(req, res);
})

async function getStudentLookedUp(req, res){
  const votes = await getLookedup(req.params.userId);
  res.render('inst/student', {user_id: req.params.userId, votes: votes, title: 'Looked up words'});
}

async function getLookedup(student_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.word_id, book_name, word, sentence, updated_on
    FROM votes v 
    JOIN books b ON v.book_id = b.id
    JOIN dictionary_words dw ON dw.id = v.word_id
    WHERE v.user_id = ? AND v.meaning_id IS NULL
    GROUP BY v.word_id;`, [student_id],
    (err, rows, fields) => {
      if (err) {
        resolve(null);
        return;
      }
      else {
        resolve(rows);
        return;
      }
    })
  });
}


module.exports = router;