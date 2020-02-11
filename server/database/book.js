const express = require('express');
const db = require('../database/db');

var book = {
    getBookId: async function (title, author) {
        return new Promise(function (resolve, reject) {
            db.query(`SELECT id FROM books where book_name=? and author_name=?;`, [title, author], (err, result, fields) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (result.length != 0) {
                    resolve(result[0].id);
                    return;
                }
                db.query('INSERT into books (`book_name`, `author_name`) VALUES (?,?);', [title, author], (err, result, fields) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.insertId);
                });
            });
        });
    },
}
module.exports = book;