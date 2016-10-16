/**
 * Created by Mahesh on 10/15/16.
 */

EPUBJS.Hooks.register("beforeChapterDisplay").selectword = function(callback, renderer){


    document.getElementById("robot").ondblclick = function() {showmeaning()};
    showmeaning();


    if(callback) callback();

};


function showmeaning() {

    console.log("mr robot");
}
