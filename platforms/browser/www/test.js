$('#pdfToEpub').click(function () {
    fileChooser.open(function (furi) {
      var suri = furi;
      // Android Permissions are asked when required
      var permissions = cordova.plugins.permissions;
      permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);

      function checkPermissionCallback(status) {
        if (!status.hasPermission) {
          var errorCallback = function () {
            console.warn('File permission is not turned on');
          }

          permissions.requestPermission(
            permissions.READ_EXTERNAL_STORAGE,
            function (status) {
              if (!status.hasPermission) errorCallback();
            },
            errorCallback);
        }
      }
      // The Filepath plugin is used to get path where .epub will be unzipped
      window.FilePath.resolveNativePath(suri, function (uri) {
        var source = uri;
        // String manipulation to get exact path and name
        var slash_index = uri.lastIndexOf("/") + 1;
        var epubindex = uri.lastIndexOf(".epub");
        var onlyname = uri.substring(slash_index, epubindex);
        onlyname = onlyname.replace(/-/g, " ");
        var bname = toTitleCase(onlyname);
        //Create directory for the book in the application path, if directory already exists it is overwritten.
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,  creatingFolder, function (error) {
          console.log(error);
        });
        //This function creates the folder.
        function creatingFolder(fileSystem) {
          var entry = fileSystem.filesystem.root;
          //The following function includes callback for when entry is successful.
          entry.getDirectory(bname, {create: true, exclusive: false}, win, function (error) {
            console.log(error);
          });
        }
        //After a successful directory creation the following callback is called.
        function win(dir) {
          var dest = dir.nativeURL;
          var linkname = dest;
          // The book path and name are stored in database.
          var db = window.sqlitePlugin.openDatabase({name: 'demo.db', location: 'default'});
          db.transaction(function(tx) {
            //Checking if book is already present.
            var statement = "SELECT count(*) AS num FROM BooksTable where name='" + bname + "'";
            tx.executeSql('CREATE TABLE IF NOT EXISTS BooksTable (name, link, flag, author,imgpath)');
            tx.executeSql("SELECT count(*) AS num FROM BooksTable where name='"+ bname+"'", [], function(tx,rs) {
              console.log(rs.rows.item(0).num);
              if(rs.rows.item(0).num<1)
              {
                db.transaction(function (tx) {
                  // Insert books to BooksTable
                  tx.executeSql('CREATE TABLE IF NOT EXISTS BooksTable (name, link, flag, author,imgpath)');
                  tx.executeSql('INSERT INTO BooksTable VALUES (?,?,?,?,?)', [bname,
                    linkname,0,'','']);
                }, function (error) {
                  console.log('Transaction ERROR: ' + error.message);
                }, function () {
                  console.log('Inserted');
                });
              }

            }, function(tx, error) {
              console.log('SELECT error: ' + error.message);
            });
          });
          //This function unzips the content of the .epub file and its callback refreshes Home page
          zip.unzip(source, dest, zipCallback);

          function zipCallback(zipEvent) {
            if(zipEvent==0){
              console.log("unzipped");
              window.location.href=window.location.href;

            }
            else{
              console.log("unzip failure");
            }
          }
        }

      }, function (error) {
        console.log(error);
      });
    }, function (errs) {
      console.log(errs);
    });
  });