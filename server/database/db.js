const express = require('express');
const mysql = require('mysql');

// var mysqlConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password:'',
//     database: 'Koob_test'
// });

var mysqlConnection = mysql.createConnection({
        host: 'koob-test-db.c9r4wsiwqsvu.us-east-2.rds.amazonaws.com',
        user: 'admin',
        port: '3306',
        password:'koobproject',
        database: 'innodb'
    });

mysqlConnection.connect((err) => {
    if(!err) {
        console.log('DB connected!') // DB SUCCESSFUL
    }
    else {
        console.log(err,`Here is the error:${JSON.stringify(err)}`)
    }
});

module.exports = mysqlConnection;