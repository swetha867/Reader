/**
 * Created by Mahesh on 11/28/16.
 */


// $('.option_box').on('click',function(){
//
//
//
// });
$(document).ready(function() {
$('.option_box').on('click',function a (){

    console.log("Click detected");

    $(this).css({'background-color': 'red'});


    if($(this).hasClass('correct')){

        $(this).css({'background-color': 'green'});
    }

    else
    {
        $(this).css({'background-color': 'red'});
    }

    $(this).fadeOut(500);
    $(this).fadeIn(500);
    $(this).fadeOut(500);
    $(this).fadeIn(500, function () {


        $('.one').css({'display':'none'});
        $('.two').css({'display':'block'});
    });
});

    $('.option_box2').on('click',function a (){

        $(this).css({'background-color': 'red'});


        if($(this).hasClass('correct')){

            $(this).css({'background-color': 'green'});
        }

        else
        {
            $(this).css({'background-color': 'red'});
        }

        $(this).fadeOut(500);
        $(this).fadeIn(500);
        $(this).fadeOut(500);
        $(this).fadeIn(500, function () {


            $('.two').css({'display':'none'});
            $('.one').css({'display':'block'});
        });
    });

});
// setInterval(blinker, 1000);

// function blinker() {
//     $('.blink_me').fadeOut(500);
//     $('.blink_me').fadeIn(500);
// }
//
// setInterval(blinker, 1000);