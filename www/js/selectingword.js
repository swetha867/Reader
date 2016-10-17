/**
 * Created by Mahesh on 10/15/16.
 */

EPUBJS.Hooks.register("beforeChapterDisplay").selectword = function(callback, renderer){


    console.log(renderer);

    //document.getElementById("robot").ondblclick = function() {showmeaning()};

    showmeaning(renderer);



    if(callback) callback();

};
$(renderer.element).contents().find('body').bind('mouseup', function(){
    alert("Hi");
});


function showmeaning(renderer) {


}

