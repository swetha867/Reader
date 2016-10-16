/**
 * Created by Mahesh on 10/15/16.
 */

EPUBJS.Hooks.register("beforeChapterDisplay").selectword = function(callback, renderer){

    alert("mr robot");

    if(callback) callback();
};

