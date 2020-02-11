const db = require('../database/db');
var moment = require('moment');

class Reading {
    static limit = 3600; // 1 hour limit to make a new session

    static async getSessionId(user_id, start_ts) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM readings WHERE user_id = ? ORDER BY end DESC', [user_id]
                , (err, rows, fields) => {
                    if (err || !rows) {
                        reject(err);
                        return;
                    }
                    // There is no readings done by the user, lets start at session 0.
                    if (rows.length == 0) {
                        resolve(0);
                        return;
                    }
                    if (moment(start_ts).diff(moment(rows[0].end), 'seconds') < Reading.limit) {
                        resolve(rows[0].session);
                        return;
                    }
                    resolve(rows[0].session + 1);
                });
        });
    }
}

module.exports.Reading = Reading;
