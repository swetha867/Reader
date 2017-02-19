/**
 * Created by Mahesh on 10/15/16.
 */
// List of words searched for
var arr = [];

var a = 0;

var wordstorage= window.localStorage;

function refreshme(){
    window.location.href=window.location.href;
}

function refreshPage()
{
    $.mobile.changePage(window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
}

//Hook to perform task after everytime user turns page
EPUBJS.Hooks.register("beforeChapterDisplay").selectword = function(callback, renderer){

    //Display Dom structure of book in iframe
    var textosay = renderer.contents.innerText;
     console.log(textosay);
    var toc =Book.getToc();
    // console.log(toc);



    //Add css to chapter head
    //EPUBJS.core.addCss("../www/css/try.css", false, renderer.doc.head);
    EPUBJS.core.addCss("../css/insidebook.css", false, renderer.doc.head);
    //access iframe info
    //var range = $(renderer.render.window).height();

    $(renderer.doc).on("swipeleft",function(){
        Book.nextPage();
    });

    $(renderer.doc).on("swiperight",function(){
        Book.prevPage();
    });

    function successFunction()
    {
        console.info("It worked!");
    }

    function errorFunction(error)
    {
        console.error(error);
    }

    function trace(value)
    {
        console.log(value);
    }

    // var hammertime= document.getElementById('fullscreen');
    // var hammertimes= document.getElementById('screener');
    //
    // var fullscreener = new Hammer(hammertime);
    // var smallscreener = new Hammer(hammertimes);

    var mc = new Hammer(renderer.doc);
    // mc.get('pinch').set({ enable: true });
    // mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

       $(document).on('click', '#fullscreen', function(){
               $('#readerheader').css('visibility', 'hidden');
               $('#readerfooter').css('visibility', 'hidden');
                // $("body").css('background-color','white');
                 $('body').css({
                    'background-color' : 'white',
                    'background' : 'none'
       });
               $('#screener').css('display', 'block');
               AndroidFullScreen.immersiveMode();
       });

           $(document).on('click', '#screener', function(){

               $.mobile.changePage("home.html", {transition: "none"});

               $('body').css({

                   'background' : "radial-gradient(circle, transparent 20%, slategray 20%, slategray 80%, transparent 80%, transparent),radial-gradient(circle, transparent 20%, slategray 20%, slategray 80%, transparent 80%, transparent) 50px 50px,linear-gradient(#A8B1BB 8px, transparent 8px) 0 -4px,linear-gradient(90deg, #A8B1BB 8px, transparent 8px) -4px 0;",
                   'background-color' : 'slategray'
               });
                    $('#readerheader').css('visibility', 'visible');
                   $('#readerfooter').css('visibility', 'visible');
                   // $('#screener').css('display', 'none');
                   AndroidFullScreen.showSystemUI();



       });


    // $(renderer.render.window).on("swiperight",function(){
    //     Book.prevPage();
    // });

    //Get an element on parent html from iframe. The following is for wrapper div.

    var wrap = $(renderer.render.window.frameElement).parent().parent().parent().contents()[0].nextSibling;

    var definer = $(renderer.render.window.frameElement).parent().parent().parent().parent().parent().parent().contents()[22];
    var cancelus = $(renderer.render.window.frameElement).parent().parent().parent().parent().parent().parent().contents()[28];
    var speaker = $(renderer.render.window.frameElement).parent().parent().parent().parent().parent().parent().contents()[30];
    var shutters = $(renderer.render.window.frameElement).parent().parent().parent().parent().parent().parent().contents()[32];

    var speakout = function(){

        TTS.speak(textosay, function () {
            console.log('success');
        }, function (reason) {
            console.log(reason);
        });

    }

    var speakless = function(){

        TTS.speak('', function () {
            console.log('success');
        }, function (reason) {
            console.log(reason);
        });

    }

    speaker.addEventListener("click", speakout, false);
    shutters.addEventListener("click", speakless, false);

    console.log($(renderer.render.window.frameElement).parent().parent().parent().parent().parent().parent().contents());

    //Select all elements in iframe dom with p
    var elements = renderer.doc.querySelectorAll('p'),

        //Perform actions on each of the elements. Each item is paragraph in book html
        items = Array.prototype.slice.call(elements);
            // console.log(elements);
            // console.log(items);
            items.forEach(function(item){

                // Get the word from book and store in variable t on double-click
                // console.log(item.innerText.split(/([\.\?!])(?= )/));


                $(item).on('dblclick',function(){
                    //console.log(item);
                    localStorage.sentence = '';
                    localStorage,meaning= '';
                    localStorage.word = '';



                    //get the word from screen
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

                    String.prototype.replaceAll = function(target, replacement) {
                        return this.split(target).join(replacement);
                    };

                    var replacee = " " + t;
                    var replacer = " <span class='hilite'>" + t +"</span>";

                    // var replacer = " <div data-role='popup' id='myPopup' class='godown' ><a class='ui-btn-inline'> </a><a class='ui-btn ui-btn-inline'> hi </a><a class='ui-btn ui-btn-inline'> bi </a></div><a href='#myPopup' data-rel='popup' class='makelinkblack'><span class = 'makespanblack hilite'>" + t +"</span></a>";
                    var temp = item.innerHTML;
                    var temper = item.innerHTML.replaceAll(replacee, replacer);


                    // temp = innerHTML;
                    // for(var k= 0; k<single_instance.length - 1; k++){
                    //
                    //     temp = temp + single_instance[k] + "<span class='hilite'>"+ " " + t+ " " + "</span>" + single_instance[k + 1]  ;
                    // }

                    // temp = single_instance[0] + "<span class='abc'>" + t + "</span>" + single_instance[1];

                    item.innerHTML = temper;
                    console.log(item.innerHTML);

                    var array_of_sentences = (item.innerText.split("."));
                    for (var i=0; i<array_of_sentences.length;i++){

                        var single = array_of_sentences[i];
                        if (single.includes(t))
                            localStorage.sentence = array_of_sentences[i];
                            }


                    // Store word in array for future use



                    // Display the hidden div

                     // wrap.style.display = "block";
                    definer.style.display = "block";
                    cancelus.style.display = "block";
                    // $('#canceler').css('display', 'block');


                    // Different alternatives to add elements to dom
                    //var division = parent.createElement("div");
                    //renderer.render.document.body.appendChild(division);
                    //item.appendChild(division);
                    //division.parentNode.innerHTML="<iframe height='300px' width='100%' src='../www/test.html'></iframe>";


                    // // Api calls to get word meaning and image

                    var outputs = $.ajax({
                        url:'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+t+'', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
                        //url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+damn+'', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
                        type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                        data: {}, // Additional parameters here
                        dataType: 'json',
                        success: function(data) {
                            //console.log(data);

                            var output = $.ajax({
                                url: 'https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword='+t+'', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
                                //url: 'https://wordsapiv1.p.mashape.com/words/'+t+'/definitions',
                                type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                                data: {}, // Additional parameters here
                                dataType: 'json',
                                success: function(r) {
                                    //Change data.source to data.something , where something is whichever part of the object you want returned.
                                    //To see the whole object you can output it to your browser console using:
                                    //console.log(data);
                                    //console.log(r.word+" : "+r.definitions[0].definition);

                                    // console.log(r);

                                    //console.log(r.results[0].senses[0].definition[0]);

                                    var meanings = [];
                                    meanings[0] = "Definition not found";
                                    meanings[1] = "";
                                    meanings[2] = "";
                                    var ogword = t;
                                    localStorage.word = ogword;
                                    var partOfSpeech;

                                    // if (r.results[0].partOfSpeech){
                                    //     partOfSpeech=r.results[0].part_of_speech;
                                    // }

                                    try{
                                    for (var i=0; i<r.count;i++) {
                                        if (r.results[i].senses[0].definition) {
                                            meanings[i] = '[' + (i + 1) + '] ' + r.results[i].senses[0].definition[0];
                                            // console.log(meanings[i]);
                                        }
                                    }

                                    }catch(err){
                                            meanings[0] = "Definition not found";
                                        }

                                        localStorage.meaning = meanings[0];

                                    wrap.innerHTML="<span id='cross'>✖</span><div class='container'><img class = 'photo' src ='"+data.value[0].thumbnailUrl+"&w=200&h=200'/><img class='photo' src ='"+data.value[1].thumbnailUrl+"&w=200&h=200'/><img class='photo' src ='"+data.value[2].thumbnailUrl+"&w=200&h=200'/><img class='photo' src ='"+data.value[3].thumbnailUrl+"&w=200&h=200'/></div><h1>"+ogword+"</h1><div id='meaningspara'>"+meanings[0]+"<br>"+meanings[1]+"</div>";
                                    // console.log(wrap.firstChild.nextSibling.firstChild);

                                    //wrap.innerHTML="<span id='cross'>✖</span><div id='imagecontainer'><center><img src ='"+data.value[0].thumbnailUrl+"&w=200&h=200'/></center></div><h1>"+ogword+"</h1><div id='meaningspara'>"+meanings[0]+"<br>"+meanings[1]+"</div>";
                                    //mydef = data.defintinitons;
                                    //console.log(mydef);
                                    //document.getElementById("output1").innerHTML = data.definitions[0].partOfSpeech;
                                },
                                //beforeSend: function(){console.log("hey");},
                                error: function(err) { alert(err); }

                            });
                        },
                        error: function(err) { alert(err); },
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "e0e79469ea954e32a7578e19dbce617e");
                            //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");// Enter here your Mashape key
                        }
                    });

                    var openwrap = function () {

                        // if(!(localStorage.meaning == "Definition not found"))

                        var db = window.sqlitePlugin.openDatabase({name: 'demo.db', location: 'default'});

                        db.transaction(function (tx) {

                            //tx.executeSql('DROP TABLE IF EXISTS WordsTable');
                         tx.executeSql('CREATE TABLE IF NOT EXISTS WordsTable (word, meaning, sentence)');
                         tx.executeSql('INSERT INTO WordsTable VALUES (?,?,?)', [localStorage.word, localStorage.meaning, localStorage.sentence]);
                        }, function (error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function () {
                            console.log('Inserted');
                        });


                        wrap.style.display = "block";
                        definer.style.display = "none";
                        item.innerHTML = temp;


                    }

                    definer.addEventListener("click", openwrap, false);
                    // var bruh = $('#canceler');

                    //undefiner.addEventListener("click", hidepope, false);

                    // Clear and hide the popup div
                    var hidepope = function () {
                        wrap.innerHTML="";
                        wrap.style.display = "none";
                        cancelus.style.display="none";
                        definer.style.display = "none";
                        item.innerHTML = temp;

                        //wrap.parentNode.removeChild(wrap);
                    }


                    // Add click event to popup.
                    wrap.addEventListener("click", hidepope, false);
                    cancelus.addEventListener("click", hidepope, false);




                });
            });
    if(callback) callback();
};

