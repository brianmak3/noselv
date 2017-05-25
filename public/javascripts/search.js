$(document).ready(function () {


    try{
        var socket = io.connect('http://127.0.0.1:8080');
    }catch(e){
        // set status to warn
    }

    if(socket != '' && socket == 'undefined')
    {
        alert('Something is not okay');
    }
   $('#search_input').keyup(function () {
        search_val = jQuery.trim($('#search_input').val());
       if(search_val == ''){
           $('#search_results').hide();
       }else{
           $('#search_results').show();
           socket.emit('search_data',{searchdata:search_val});
       }
   }).focus(function () {
       if(search_val !=''){
           $('#search_results').show();
           socket.emit('search_data',{searchdata:search_val});
       }
   });

    socket.on('search_results',function (data) {
        $('#results_found').html('');
        if(data.length > 0){
            for(i=0; i<data.length; i++) {
                $('#results_found').append('<form action="friend_profile" method="post"><button type="submit"  class="searchResltBtn" name="username" value="'+data[i].user_name+'" > <img style="height:30px;width:30px;border-radius: 50%;margin-right:3px" src="'+data[i].profile_pic+'"/><span style=" font-family: Arial;">'+data[i].first_name+' '+data[i].last_name+'</span> </button> </form>');
            }
        }else{
            $('#results_found').html('<span style="margin-left:20px;font-size:12px;">No results found for '+search_val +'</span>');
        }
    });
    socket.on('random_friends',function (datas) {
       if(datas.length > 1){
           $('#make_friends').html('');
           datas.forEach(function (data) {
               $('#make_friends').append('<div id="'+ data.user_name +'" class="person_div" style="margin:1px"> <form action="friend_profile" method="post"> <button type="submit" name="username" value="'+ data.user_name +'" class="name_btn">'+ data.first_name + ' ' + data.last_name +'</button> </form> <img  src="'+ data.profile_pic +'" style="cursor:pointer;margin-bottom:1px;border-radius:2px;height:100px; width:100px;"> <div value="'+ data.user_name +'" class="person_image"> <span style="color:white;font-size: 17px;position:relative;top:30px;left:20px">follow</span> </div> </div>');
           });
       }
        $('.person_image').click(function () {
            var friend_user = $(this).attr('value');
            var action_frndshp = 'Follow';
            var my_user = $('#friend_maker').attr('value');
            var current_friend_display = $('#fr_me_details').attr('value');
            var current_friend_display2 = $('#fr_me_details').attr('name');
            var following = $('#follwing');
            following.text(parseInt(following.text())+ 1);
            $('#following').slideUp(300);
            $('#'+friend_user+'').hide("easeOutBounce");
            socket.emit('frndshp_action',{action_frndshp:action_frndshp,followed:friend_user, following:my_user});
            if(current_friend_display == current_friend_display2)
            {
                var fr_div =   $('#following_friends');
                fr_div.text(parseInt(fr_div.text())+ 1);
            }else if( friend_user == current_friend_display2){
                var fr_div =   $('#followed_friends');
                fr_div.text(parseInt(fr_div.text())+ 1);
                $('.friend_link').text('Unfollow');
            }
        });
    });

    $(document).click(function(event) {
        var class_clicked = $(event.target).attr('id');
        search_val = jQuery.trim($('#search_input').val());
        if(class_clicked != 'search_input'){
            $('#search_results').hide();
        }
    });
    $('.person_div').click(function () {
        $(this).hide("easeOutBounce");
    });
    $('.person_image').click(function () {
        var friend_user = $(this).attr('value');
        var action_frndshp = 'Follow';
        var my_user = $('#friend_maker').attr('value');
        var current_friend_display = $('#fr_me_details').attr('value');
        var current_friend_display2 = $('#fr_me_details').attr('name');
        var following = $('#follwing');
        following.text(parseInt(following.text())+ 1);
        $('#following').slideUp(300);
        socket.emit('frndshp_action',{action_frndshp:action_frndshp,followed:friend_user, following:my_user});
        if(current_friend_display == current_friend_display2)
        {
            var fr_div =   $('#following_friends');
            fr_div.text(parseInt(fr_div.text())+ 1);
        }else if( friend_user == current_friend_display2){
            var fr_div =   $('#followed_friends');
            fr_div.text(parseInt(fr_div.text())+ 1);
            $('.friend_link').text('Unfollow');
        }
    });

    setInterval(function () {
        var user_name = $('#user_username').text();
        socket.emit('get_random_friends',{user_to_search: user_name});
    },30000);
});

