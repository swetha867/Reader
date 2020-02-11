const db = require('../database/db');

class User {

  static async checkValid(email, student_id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ? AND student_id = ?', [email, student_id]
        , (err, rows, fields) => {
          if (err) {
            reject(err);
            resolve(false);
          }
          if (!rows || rows == null || rows.length !== 1) {
            resolve(false);
          }
          resolve(rows[0]);
        });

    });
  }
}

module.exports.User = User;