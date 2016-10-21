/**
 * Created by Mahesh on 10/15/16.
 */

EPUBJS.Hooks.register("beforeChapterDisplay").selectword = function(callback, renderer){


    console.log(renderer);


    var elements = renderer.doc.querySelectorAll('p'),
        items = Array.prototype.slice.call(elements);

    items.forEach(function(item){

        $(item).on('dblclick',function(){
            console.log(item);
            var t = '';
            if (window.getSelection && (sel = window.getSelection()).modify) {
                // Webkit, Gecko
                var s = renderer.render.window.getSelection();
                if (s.isCollapsed) {
                    s.modify('move', 'forward', 'character');
                    s.modify('move', 'backward', 'word');
                    s.modify('extend', 'forward', 'word');
                    t = s.toString();
                    s.modify('move', 'forward', 'character'); //clear selection
                }
                else {
                    t = s.toString();
                }
            } else if ((sel = document.selection) && sel.type != "Control") {
                // IE 4+
                var textRange = sel.createRange();
                if (!textRange.text) {
                    textRange.expand("word");
                }
                // Remove trailing spaces
                while (/\s$/.test(textRange.text)) {
                    textRange.moveEnd("character", -1);
                }
                t = textRange.text;
            }
            //alert(t);
            var output = $.ajax({
                url: 'https://wordsapiv1.p.mashape.com/words/'+t+'/definitions', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
                type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                data: {}, // Additional parameters here
                dataType: 'json',
                success: function(data) {
                    //
                    //Change data.source to data.something , where something is whichever part of the object you want returned.
                    //To see the whole object you can output it to your browser console using:
                    //console.log(data);
                    alert(data.word+" : "+data.definitions[0].definition);

                    //document.getElementById("output").innerHTML = data.word;

                    //mydef = data.defintinitons;
                    //console.log(mydef);
                    //document.getElementById("output1").innerHTML = data.definitions[0].partOfSpeech;
                    //document.getElementById("output2").innerHTML = data.definitions[0].definition;


                },
                error: function(err) { alert(err); },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-Mashape-Authorization", "CgCJYxK5TImshi7Bm5GslCFSrNkVp1Ii23yjsnNvrCT8Md9veb"); // Enter here your Mashape key
                }
            });
        });


    });


    if(callback) callback();

};



function showmeaning(renderer) {

    alert("Hi");
    console.log("Hi");

}

