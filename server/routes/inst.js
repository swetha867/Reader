const express = require('express');
const db = require('../database/db');
const passport = require('passport');
const dic = require('../api/dictionary');
const router = express.Router();
const util = require('util')
var moment = require('moment');


router.get('/', (req, res) => {
  res.render('inst/index');
})

router.get('/books', (req, res) => {
  getBooks(req, res);
});

async function getBooks(req, res) {
  db.query(`SELECT b.id, book_name, author_name,
    (SELECT COUNT(*) FROM PageTable WHERE book_id = b.id) readings,
    (SELECT COUNT(*) FROM votes WHERE book_id = b.id) votes
    FROM books b where b.id != 34 and b.id!= 35 
    ORDER BY b.id`, [], (err, books, fields) => {
    if (err) {
      res.send(err);
      return;
    }
    res.render('inst/books', { books: books });
  });
}

router.get('/book/:bookId/readings', (req, res) => {
  getBookReadings(req, res);
});

async function getBookReadings(req, res) {
  const rows = await getPagesByBook(req.params.bookId);
  const userReadings = await getTimePerStudent(req.params.bookId);
  const userReadingsGraph = await getBookReading(req.params.bookId);

  var books = [];
  var book = '';
  // reuslt must be sorted by book_name
  for (var i = 0; i < rows.length; i++) {
    let timestamp='';
    if (book == '') { // first time
      book = newBook(rows[i].book_name, rows[i].author_name)
    }
    timestamp = rows[i].start;
    timestamp = timestamp.toString();
    var resultTime = timestamp.split('GMT');
    book.sessions.add("u" + rows[i].user_id + "s" + rows[i].session+ ' ' + '/' + 'sessionStart:' +resultTime[0]);
    var current_seconds = rows[i].seconds.split(',');
    var current_pages = rows[i].pages.split(',');
    for (var j = 0; j < current_seconds.length; j++) {
      // check if there is exsiting data
      if (!book.pages.has(current_pages[j])) {
        book.pages.set(current_pages[j], { 'page': current_pages[j] });
      }
      var pageObject = book.pages.get(current_pages[j]);
      pageObject["u" + rows[i].user_id + "s" + rows[i].session+ ' ' + '/' + 'sessionStart:' +resultTime[0]] = current_seconds[j]
      book.pages.set(current_pages[j], pageObject);
    }
    if (i == rows.length - 1 || book.title != rows[i + 1].book_name) {
      book.pages = new Map([...book.pages.entries()].sort(
        function (a, b) {
          return parseInt(a) - parseInt(b);
        }
      ));
      books.push(book);
      book = '';
    }
  }

  // console.log(util.inspect(userReadingsGraph, false, null, true /* enable colors */))


  res.render('inst/book/readings', { books: books, userReadings: userReadings, userReadingsGraph: userReadingsGraph });
}

async function getPagesByBook(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT book_name, author_name, font_size, user_id, session, start,
    GROUP_CONCAT(seconds ORDER BY page_number ASC) as seconds,
    GROUP_CONCAT(page_number ORDER BY page_number ASC) as pages
    FROM readings r 
    JOIN books b ON r.book_id = b.id
    WHERE book_id = ?
    GROUP BY user_id, session
    ORDER BY book_name ASC;`, [book_id],
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

async function getTimePerStudent(bookID) {
  return new Promise(function (resolve, reject) {
    //var bookID = req.params.bookId;
    var userReadings = [];
    db.query(`Select user_id, SUM(seconds) as seconds 
                  From PageTable where book_id = ?
                  GROUP BY(user_id);`, [bookID], (err, rows, field) => {
      if (err) {
        console.log("Error in getTimePerStudent:", err);
        resolve(null);
        return;
      }
      else {
        resolve(rows);
      }
    });
  });
}

router.get('/book/:bookId/words', (req, res) => {
  getBookWords(req, res);
});

async function getBookWords(req, res) {
  const votes = await getBookWordsHelper(req.params.bookId);
  res.render('inst/book/words', { user_id: req.params.userId, votes: votes, title: 'Combined words from all students' });
}

async function getBookWordsHelper(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT book_name, v.word_id, word, GROUP_CONCAT(DISTINCT meaning SEPARATOR '@@@') as meanings,
    sentence, updated_on, SUM(freq) totalFreq
    FROM votes v 
    JOIN books ON book_id = books.id
    JOIN dictionary_words dw ON dw.id = v.word_id
    LEFT JOIN dictionary_meanings dm ON v.meaning_id = dm.id
    WHERE book_id = ?
    GROUP BY v.word_id, sentence
    ORDER BY totalFreq DESC`, [book_id],
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

router.get('/book/:bookId/words/histogram', (req, res) => {
  getBookWordsHistogram(req, res);
});

async function getBookWordsHistogram(req, res) {
  const votes = await getBookWordsHistogramHelper(req.params.bookId);
  res.render('inst/book/words-histogram', { moment:moment, votes: votes, title: 'Combined words from all students' });
}

async function getBookWordsHistogramHelper(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT book_name, v.word_id, word, SUM(freq) totalFreq, MAX(updated_on) lastLookedup
    FROM votes v 
    JOIN books ON book_id = books.id
    JOIN dictionary_words dw ON dw.id = v.word_id
    WHERE book_id = ?
    GROUP BY v.word_id
    ORDER BY totalFreq DESC`, [book_id],
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

























router.get('/students', (req, res) => {
  getStudents(req, res);
});

async function getStudents(req, res) {
  var students = await getStudentsHelper();

  for (var i = 0; i < students.length; i++) {
    students[i].words = await addWordsToStudents(students[i].id);
    students[i].pages_normal = await addPageReadToStudents(students[i].id);
  }

  res.render('inst/students', { students: students });
}

async function getStudentsHelper() {
  return new Promise(function (success, fail) {
    db.query(`SELECT u.id,
    COUNT(*) votes,
    (SELECT COUNT(*) FROM PageTable WHERE user_id = u.id) pages
    FROM users u 
    JOIN votes v ON v.user_id = u.id
    GROUP BY u.id`, [], (err, students, fields) => {
      if (err) {
        console.log(err);
        fail(err);
        return;
      }
      success(students);
    })
  });
}

async function addWordsToStudents(user_id) {
  return new Promise(function (success, fail) {
    db.query(`SELECT GROUP_CONCAT(word SEPARATOR ', ') words
    FROM(
    SELECT word FROM votes v2 JOIN dictionary_words w2 ON v2.word_id = w2.id
    WHERE v2.user_id = ?
    ORDER BY v2.id DESC
    LIMIT 0,7
    ) w`, [user_id], (err, rows, fields) => {
      if (err) {
        console.log(err);
        fail(err);
      }
      success(rows[0].words);
    })
  });
}

async function addPageReadToStudents(user_id) {
  return new Promise(function (success, fail) {
    db.query(`SELECT CASE font_size
    WHEN  90 THEN 2.2
    WHEN  100 THEN 1.5
    WHEN  120 THEN 1
    WHEN  150 THEN 0.65
    WHEN  200 THEN 0.43
    ELSE 0
    END AS mult, COUNT(*) c  FROM PageTable WHERE user_id = ? GROUP BY font_size`, [user_id], (err, rows, fields) => {
      if (err) {
        console.log(err);
        fail(err);
      }
      var totalCount = 0;
      for (i = 0; i < rows.length; i++) {
        totalCount += rows[i].mult * rows[i].c;
      }
      success(Math.round(totalCount));
    })
  });
}

router.post('/vote', (req, res) => {
  postVote(req, res);
})

async function postVote(req, res) {
  var vote_id = req.body.vote_id;
  var meaning_id = req.body.meaning_id;

  var vote = (await getVoteById(req.body.vote_id))[0];

  if (vote == null) {
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
          [req.user.id, vote.book_id, vote.word_id, meaning_id, vote.sentence], (err, rows, fields) => {
            if (err) {
              console.log(`Error line 56: ${err}`)
              res.send(`Here is the error ${err}`);
              return;
            }
            console.log("vote details inserted!");
            res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id });
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
            res.send({ res: 'success', vote_id: vote_id, meaning_id: meaning_id });
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

async function getVote(req, res) {
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getPendingVotesForBook(books[i].id);
  }
  res.render('inst/vote', { books: books });
}


/**
 * GET /votes
 * History of instructor votes
 */
router.get('/votes', (req, res) => {
  getVotes(req, res);
})

async function getVotes(req, res) {
  const books = await getAllBooks();

  for (i = 0; i < books.length; i++) {
    books[i].votes = await getVotesForBook(req.user.id, books[i].id);
  }
  res.render('inst/votes', { books: books });
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
        } else {
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
        } else {
          resolve(rows);
          return;
        }
      })
  });
}



// router.get('/student/voted/:userId', (req, res) => {
//   getStudentVoted(req, res);
// })

// async function getStudentVoted(req, res){
//   const votes = await getStudentVotes(req.params.userId);
//   res.render('inst/student', {user_id: req.params.userId, votes: votes, title: 'Voted words'});
// }

// async function getStudentVotes(student_id) {
//   return new Promise(function (resolve, reject) {
//     db.query(`SELECT v.word_id, book_name, word, sentence, meaning, updated_on
//     FROM votes v 
//     JOIN books b ON v.book_id = b.id
//     JOIN dictionary_meanings dm ON v.meaning_id = dm.id
//     JOIN dictionary_words dw ON dw.id = v.word_id
//     WHERE v.user_id = ?
//     GROUP BY v.word_id;`, [student_id],
//     (err, rows, fields) => {
//       if (err) {
//         resolve(null);
//         return;
//       }
//       else {
//         resolve(rows);
//         return;
//       }
//     })
//   });
// }

/**
 * GET /student/lookedup
 */
// router.get('/student/lookedup/:userId', (req, res) => {
//   getStudentLookedUp(req, res);
// })

// async function getStudentLookedUp(req, res){
//   const votes = await getLookedup(req.params.userId);
//   res.render('inst/student', {user_id: req.params.userId, votes: votes, title: 'Looked up words'});
// }

// async function getLookedup(student_id) {
//   return new Promise(function (resolve, reject) {
//     db.query(`SELECT v.word_id, book_name, word, sentence, updated_on
//     FROM votes v 
//     JOIN books b ON v.book_id = b.id
//     JOIN dictionary_words dw ON dw.id = v.word_id
//     WHERE v.user_id = ? AND v.meaning_id IS NULL
//     GROUP BY v.word_id;`, [student_id],
//     (err, rows, fields) => {
//       if (err) {
//         resolve(null);
//         return;
//       }
//       else {
//         resolve(rows);
//         return;
//       }
//     })
//   });
// }

router.get('/student/reading/:userId', (req, res) => {
  getStudentReading(req, res);
})

function newBook(name, author) {
  // console.log("new book : " + name);
  return { title: name, author: author, sessions: new Set(), pages: new Map()};
}

async function getStudentReading(req, res) {
  const rows = await getPages(req.params.userId);
  var books = [];
  var book = '';
  // reuslt must be sorted by book_name
  for (var i = 0; i < rows.length; i++) {
    if (book == '') { // first time
      book = newBook(rows[i].book_name, rows[i].author_name)
    }
    book.sessions.add("s" + rows[i].session);
    var current_seconds = rows[i].seconds.split(',');
    var current_pages = rows[i].pages.split(',');
    for (var j = 0; j < current_seconds.length; j++) {
      // check if there is exsiting data
      if (!book.pages.has(current_pages[j])) {
        book.pages.set(current_pages[j], { 'page': current_pages[j] });
      }
      var pageObject = book.pages.get(current_pages[j]);
      pageObject["s" + rows[i].session] = current_seconds[j]
      book.pages.set(current_pages[j], pageObject);
    }
    if (i == rows.length - 1 || book.title != rows[i + 1].book_name) {
      book.pages = new Map([...book.pages.entries()].sort(
        function (a, b) {
          return parseInt(a) - parseInt(b);
        }
      ));
      books.push(book);
      book = '';
    }
  }

  // console.log(util.inspect(books, false, null, true /* enable colors */))
  /*
  Sample Data for books:
  [
  {
    title: 'Test Book',
    author: 'Sol',
    sessions: Set(5) { 's0', 's1', 's2', 's3', 's4' },
    pages: Map(4) {
      '1' => { page: '1', s0: '15', s1: '15', s2: '15', s3: '15' },
      '2' => { page: '2', s3: '20' },
      '3' => { page: '3', s3: '12' },
      '4' => { page: '4', s3: '22', s4: '22' }
    }
  }
  ]
  */
  res.render('inst/student_reading', { user_id: req.params.userId, books: books });
}

async function getPages(user_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT book_name, author_name, font_size, session,
      GROUP_CONCAT(seconds ORDER BY page_number ASC) as seconds,
      GROUP_CONCAT(page_number ORDER BY page_number ASC) as pages
      FROM readings r 
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ?
      GROUP BY book_id, session
      ORDER BY book_name ASC;`, [user_id],
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


async function getBookReading(book_id) {
  const rows = await getPagesByBookId(book_id);
  var books = [];
  var book = '';
  // result must be sorted by book_name
  for (var i = 0; i < rows.length; i++) {
    if (book == '') { // first time
      book = newBook(rows[i].book_name, rows[i].author_name)
      book.user_id = rows[i].user_id
    }
    book.sessions.add("s" + rows[i].session);
    var current_seconds = rows[i].seconds.split(',');
    var current_pages = rows[i].pages.split(',');
    for (var j = 0; j < current_seconds.length; j++) {
      // check if there is exsiting data
      if (!book.pages.has(current_pages[j])) {
        book.pages.set(current_pages[j], { 'page': current_pages[j] });
      }
      var pageObject = book.pages.get(current_pages[j]);
      pageObject["s" + rows[i].session] = current_seconds[j]
      book.pages.set(current_pages[j], pageObject);
    }
    if (i == rows.length - 1 || book.user_id != rows[i + 1].user_id) {
      book.pages = new Map([...book.pages.entries()].sort(
        function (a, b) {
          return parseInt(a) - parseInt(b);
        }
      ));
      books.push(book);
      book = '';
    }
  }
  return (books);
}

async function getPagesByBookId(book_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT book_name, author_name, font_size, session, user_id, start,
      GROUP_CONCAT(seconds ORDER BY page_number ASC) as seconds,
      GROUP_CONCAT(page_number ORDER BY page_number ASC) as pages
      FROM readings r 
      JOIN books b ON r.book_id = b.id
      WHERE b.id = ?
      GROUP BY user_id, session
      ORDER BY user_id ASC;`, [book_id],
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

router.get('/student/votes/:userId', (req, res) => {
  getStudentVotes(req, res);
})

async function getStudentVotes(req, res) {
  const votes = await getStudentVotesHelper(req.params.userId);
  res.render('inst/studentnew', { user_id: req.params.userId, votes: votes, title: 'Voted words' });
}

async function getStudentVotesHelper(student_id) {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT v.word_id, book_name, word, sentence, meaning, updated_on
    FROM votes v 
    JOIN books b ON v.book_id = b.id
    JOIN dictionary_words dw ON dw.id = v.word_id
    LEFT JOIN dictionary_meanings dm ON v.meaning_id = dm.id
    WHERE v.user_id = ?
    GROUP BY v.word_id
    ORDER BY updated_on DESC`, [student_id],
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

// Survey Results

router.get('/results', (req, res) => {
  // res.send('Survey Results');
  getSurveyResults(req, res);
});

async function getSurveyResults(req, res) {
  return new Promise(function (resolve, reject) {
    db.query(`Select * from survey2 ORDER BY timestamp DESC`, [], (err, rows, fields) => {
      if (err) {
        console.log("Error in fetching survey results");
        resolve(null);
        return;
      }
      else {
        console.log("Results", rows);
        res.render('inst/results', { results : rows });
        resolve(rows);
        return;
      }
    });
  });
}
module.exports = router;