
var db = window.sqlitePlugin.openDatabase({ name: 'demo.db', location: 'default' });

function offlineSync() {
    db.transaction(function (tx) {
        tx.executeSql("Select * from PageTable", [], function querySuccess (tx,results) {
            console.log("Results are:", results);
        }, function error (tx, err) {
            console.log("Error is", err);
        })
    })
}