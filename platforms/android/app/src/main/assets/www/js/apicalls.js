/**
 * Created by Mahesh on 10/9/16.
 */


var damn = "decadence";
function doIt() {
  var output = $.ajax({
    url: 'https://wordsapiv1.p.mashape.com/words/' + damn + '/definitions', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
    type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
    data: {}, // Additional parameters here
    dataType: 'json',
    success: function (data) {
      //
      //Change data.source to data.something , where something is whichever part of the object you want returned.
      //To see the whole object you can output it to your browser console using:
      //console.log(data);
      console.log(data.definitions);

      document.getElementById("output").innerHTML = data.word;

      mydef = data.defintinitons;
      console.log(mydef);
      document.getElementById("output1").innerHTML = data.definitions[0].partOfSpeech;
      document.getElementById("output2").innerHTML = data.definitions[0].definition;


    },
    error: function (err) { alert(err); },
    beforeSend: function (xhr) {
      xhr.setRequestHeader("X-Mashape-Authorization", "CgCJYxK5TImshi7Bm5GslCFSrNkVp1Ii23yjsnNvrCT8Md9veb"); // Enter here your Mashape key
    }
  });
}

function dontIt() {
  var output = $.ajax({
    url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + damn + '', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
    //url: 'https://www.googleapis.com/customsearch/v1?q=' + damn + '',
    //url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+damn+'', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
    type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
    data: {}, // Additional parameters here
    dataType: 'json',
    success: function (data) {
      //
      //Change data.source to data.something , where something is whichever part of the object you want returned.
      //To see the whole object you can output it to your browser console using:
      //console.log(data);

      document.getElementById("output5").innerHTML = "<img src ='" + data.value[0].thumbnailUrl + "&w=200&h=200'/>";



    },
    error: function (err) { alert(err); },
    beforeSend: function (xhr) {
      //xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "e0e79469ea954e32a7578e19dbce617e"); // Enter here your Mashape key
    }
  });
}


