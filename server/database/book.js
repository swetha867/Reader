const express = require('express');
const db = require('../database/db');

var book = {
    getBookId: async function (title, author) {
        console.log(title);
        console.log(author);
        
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
                // Storing the book with book name and author name in the Books Table
                db.query('INSERT into books (`book_name`, `author_name`) VALUES (?,?);',
                     [title, author],   (err, result, fields) => {
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