const db = require('../database/db');

class User {

  static async checkValid(email, student_id) {
    return db.query('SELECT * FROM users WHERE email = ? AND student_id = ? ', [email,student_id])
      .then(([rows, fields]) => {
        if (!rows || rows == null || rows.length !== 1) {
          return false;
        }
        return rows[0];
      });
  }
}

module.exports.User = User;