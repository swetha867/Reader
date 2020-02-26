const db = require('../database/db');
var moment = require('moment');

class Reading {
    static limit = 3600; // 1 hour limit to make a new session

    static async getSessionId(user_id, start_ts, page_number) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM readings WHERE user_id = ? ORDER BY session DESC, end DESC, page_number DESC', [user_id]
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
                    if (page_number == rows[0].page_number + 1 && moment(start_ts).diff(moment(rows[0].end), 'seconds') < Reading.limit) {
                        console.log(rows[0].page_number + "  " + page_number);
                        resolve(rows[0].session);
                        return;
                    }
                    resolve(rows[0].session + 1);
                });
        });
    }
}

module.exports.Reading = Reading;
