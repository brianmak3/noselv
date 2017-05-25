$(document).ready(function () {
    $(".fullheight").height($(document).height());
    $('#fgpass').bind('mouseenter mouseleave',function(){
        $('#forgot_pass').toggle("easeOutBounce");
    }).click(function(){
        $('#login_div').hide('slide', {direction: 'down'});
        $('#fg_div').show('slide', {direction: 'up'});
    });
    $('#fg_link').click(function(){
        $('#fg_div').hide('slide', {direction: 'up'});
        $('#login_div').show('slide', {direction: 'down'});
    });
    $('#register_link, #login_link').click(function(){
        $('#login_div, #register_div').toggle("easeOutBounce");
    });

    $('.login_username, .login_password').keyup(function(){
        var username = jQuery.trim($('.login_username').val());
        var password = jQuery.trim($('.login_password').val());
        if(username != '' && password !=''){
            $('#sign_in_btn').attr('disabled',false).css({'backgroundColor':'white','color':'rgba( 0, 51, 102, 1)','fontWeight':'bold'});
        }else{
            $('#sign_in_btn').attr('disabled',true).css({'backgroundColor':'rgba(25,25,112,0.5)','color':'grey','fontWeight':'lighter'});
        }
    });
    $('#em_pass').keyup(function(){
        var em_pass = jQuery.trim($(this).val());
        if(em_pass != ''){
            $('#fg_btn').attr('disabled',false).css({'backgroundColor':'white','color':'rgba( 0, 51, 102, 1)','fontWeight':'bold'});
        }else{
            $('#fg_btn').attr('disabled',true).css({'backgroundColor':'rgba(25,25,112,0.5)','color':'grey','fontWeight':'lighter'});
        }
    });
    $('#vrcode').keyup(function(){
        var vr_pass = jQuery.trim($(this).val());
        if(vr_pass != ''){
            $('#vr_btn').attr('disabled',false).css({'backgroundColor':'white','color':'rgba( 0, 51, 102, 1)','fontWeight':'bold'});
        }else{
            $('#vr_btn').attr('disabled',true).css({'backgroundColor':'rgba(25,25,112,0.5)','color':'grey','fontWeight':'lighter'});
        }
    });
    $('#verification_form').submit(function () {
        var code = $('#accnt_confirmation').attr('value');
        var vr_pass = jQuery.trim($('#vrcode').val());
        if(code != vr_pass){
            $('#vrcode').prev().show();
            return false;
        }
    });

    $('#fname, #lname, #uname, #email, #pass, #cpass').keyup(function(){
        fname = jQuery.trim($('#fname').val());
        lname = jQuery.trim($('#lname').val());
        uname = jQuery.trim($('#uname').val());
        email = jQuery.trim($('#email').val());
        pass = jQuery.trim($('#pass').val());
        cpass = jQuery.trim($('#cpass').val());
        if(fname !='' && lname !='' && uname !='' && email !='' && pass !='' && cpass !=''){
            $('#register_btn').attr('disabled',false).css({'backgroundColor':'white','color':'rgba( 0, 51, 102, 1)','fontWeight':'bold'});
            $('#registration_form').submit(function () {
                if(uname.length < 8){
                    $('#uname').prev().show("bounce");
                    return false;
                }else if(uname == pass){
                    $('#pass').prev().show("bounce");
                    return false;
                }else if(pass.length < 8){
                    $('#pass').next().show("bounce");
                    return false;
                }else if(cpass != pass){
                    $('#cpass').prev().show("bounce");
                    return false;
                }
            });
        }else{
            $('#register_btn').attr('disabled',true).css({'backgroundColor':'rgba(25,25,112,0.5)','color':'grey','fontWeight':'lighter'});
        }
    });
    $(document).click(function () {
        $('.status_warn').hide();
    });
});

