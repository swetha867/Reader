function nullHandler() { };

function offlineSync() {
    var db = window.sqlitePlugin.openDatabase({ name: 'demo.db', location: 'default' });
    db.transaction(function (tx) {
        tx.executeSql("Select * from PageTable", [], function querySuccess(tx, results) {
            // console.log('temp', results.rows.item(1));
            if (results.rows.length === 0) {
                alert('Already Synced with Cloud DB!');
            }
            else {
                var syncResults = [];
                for (var i = 0; i < results.rows.length; i++) {
                    syncResults.push(results.rows.item(i));
                }

                $.ajax({
                    type: "POST",
                    url: "http://3.15.37.149:6010/page/sync",
                    data: {
                        syncData: JSON.stringify(syncResults),
                    },
                    success: function (data) {
                        // console.log(data);
                        if (data.hasOwnProperty('success') && data.success == true) {
                            // console.log('deleting all data');
                            tx.executeSql("TRUNCATE PageTable", [], nullHandler, nullHandler);
                        }
                    }
                });
            }
        }, function error(tx, err) {
            console.log("Error is", err);
        });
    })
}