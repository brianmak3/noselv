const nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var multer = require('multer');
var User = require('../routes/models/User.js');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'noselv2@gmail.com',
        pass: 'Maryhenry3'
    }
});
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        var extArray = file.mimetype.split("/");
        var extension = extArray[1];
        callback(null, file.fieldname + '_' + Date.now()+'.'+extension);
    }
});
var upload = multer({ storage : storage}).single('userPhoto');


// setup email data with unicode symbols

//using sockets
var http = require('http').Server();

client = require('socket.io').listen(8080).sockets;


module.exports = function (app, passport) {
  /* GET home page. */
        app.get('/', function(req, res){
            var lgMsg =  req.flash('loginMessage');
            if(lgMsg.length < 1) {
                res.render('index', {
                    title: 'NO SELV',
                    loginMessage: '',
                    email: '',
                    code_sent: ''
                });
            }else{
                res.render('index', {
                    title: 'NO SELV',
                    loginMessage: lgMsg[0],
                    email: lgMsg[1],
                    code_sent: lgMsg[2]
                });
            }
        });
    client.on('connection',function(socket)
    {
        socket.on('status_update',function(data){
            User.update({'user_name':data.username},{$set:{'status_update':data.status,'statusDate': data.time}},function(err){
                if(err){
                    throw err;
                }
            });
        });

        //searching for friends here
        socket.on('search_data',function(data){
            searchdata = data.searchdata;
             var search_words = searchdata.split(" ");
             if(search_words.length == 1){
                 searchdata = searchdata;
                 User.find({$or:[{'first_name':{'$regex' : searchdata, '$options' : 'i' }},{'user_name':{'$regex' : searchdata, '$options' : 'i' }}]}).sort({'first_name':1}).exec(function (err, results) {
                     if(err)
                         throw err;
                     socket.emit('search_results', results);
                 });
             }else{
                  searchdata = search_words[0];
                  last_name = search_words[1];
                 User.find({'first_name':{'$regex' : searchdata,'$options' : 'i' }, 'last_name':{'$regex' : last_name,'$options' : 'i' }}).sort({'first_name':-1}).exec(function (err, results) {
                     if(err)
                         throw err;
                     socket.emit('search_results', results);
                 });
             }


        });

        //following and unfollowing a friend
        socket.on('frndshp_action',function(data){
            var action_frdnshp = data.action_frndshp;
            if(action_frdnshp == 'Follow'){
                User.update({'user_name': data.following},{$push: {'followings': data.followed}},function (err) {
                    if(err)
                        throw err;
                });
                 User.update({'user_name': data.followed},{$push: {'followeds': data.following}},function (err) {
                    if(err)
                        throw err;
                });

            }else if(action_frdnshp == 'Unfollow'){
                User.update({'user_name': data.unfollowing},{$pull: {'followings': data.unfollowed}},function (err) {
                    if(err)
                        throw err;
                });
                User.update({'user_name': data.unfollowed},{$pull: {'followeds': data.unfollowing}},function (err) {
                    if(err)
                        throw err;
                });
            }
        });

        //getting followeings and their information
        socket.on('following', function (data) {
            User.find({'followeds': {$in:[data.user_name]}}).exec(function(err, results){
                if(err)
                    throw err;
                socket.emit('following_results', results);
            });
        })

        socket.on('followers', function (data) {
            User.find({'followings': {$in:[data.user_name]}}).exec(function(err, results){
                if(err)
                    throw err;
                socket.emit('followed_results', results);
            });
        });

        //getting random friends
        socket.on('get_random_friends',function (data) {
            User.aggregate([ {$match : {'user_name':{$ne:data.user_to_search},'followeds': {$ne:[data.user_to_search]}}}, {$sample : {size : 20 }} ]).exec(function (err, users_found) {
                if(err)
                    throw err;
              socket.emit('random_friends',users_found);
            });
        })
    });


    app.post('/friend_profile',function (req,res) {
       var friend_username = req.body.username;
       User.findOne({'user_name':friend_username}, function(err, friendDetails){
           if(err)
               throw err;
           //cheking if am a friend
           User.find({'followings':friend_username,'user_name':req.user.user_name}).exec(function (err, number_of_me) {
               if(err)
                   throw err;
               var results = number_of_me.length;
               var current_user =  req.user.user_name;
               User.aggregate([ {$match : {'user_name':{$ne:current_user},'followeds': {$ne:[current_user]}}}, {$sample : {size : 20 }} ]).exec(function (err, users_found) {
                   if(err)
                       throw err;
                   res.render('friend_profile.ejs',{
                       title: 'NO SELV',
                       user: req.user,
                       frndDetails: friendDetails,
                       results: results,
                       users_found: users_found
                   });
               });

           });

       });
    });



    app.get('/profile',isLoggedIn, function(req, res){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        var current_user =  req.user.user_name;
        User.aggregate([ {$match : {'followeds': {$ne:[current_user]}}}, {$sample : {size : 20 }} ]).exec(function (err, users_found) {
            if(err)
                throw err;
            res.render('profile', {
                title: 'NO SELV',
                user: req.user,
                users_found: users_found
            })
        });

    });
    app.get('/photo_upload',isLoggedIn, function(req, res){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        var current_user =  req.user.user_name;
        User.aggregate([ {$match : {'followeds': {$ne:[current_user]}}}, {$sample : {size : 20 }} ]).exec(function (err, users_found) {
            if(err)
                throw err;
            res.render('photo_upload.ejs', {
                title: 'NO SELV',
                user: req.user,
                users_found: users_found
            })
        });

    });
    app.post('/api/photo',function(req,res){
        upload(req,res,function(err) {
            if(err) {
                console.log(err);
                return res.end("Error uploading file.");
            }
          var profile_pic_url = 'images/'+req.file.filename;
           var   username = req.user.user_name;
         User.update({'user_name':username},{$set:{'profile_pic':profile_pic_url}},function(err){
             if(err){
                 throw err;
             }else{

                         res.redirect('/profile');

             }
         });


        });
    });
    app.post('uploaded_post',function(req,res){
        upload(req,res,function(err) {
            if(err) {
                console.log(err);
                return res.end("Error uploading file.");
            }
          var profile_pic_url = 'images/'+req.file.filename;
            res.send(profile_pic_url);
          // var   username = req.user.user_name;
        /* User.update({'user_name':username},{$set:{'profile_pic':profile_pic_url}},function(err){
             if(err){
                 throw err;
             }else{

                         res.redirect('/profile');

             }
         });*/


        });
    });







    app.post('/',passport.authenticate('local-login',{
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.get('/home',isLoggedIn, function(req, res){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        req.session.authenticated = true;
        var current_user =  req.user.user_name;
            User.aggregate([ {$match : {'followeds': {$ne:[current_user]}}}, {$sample : {size : 20 }} ]).exec(function (err, users_found) {
                if(err)
                    throw err;
                res.render('home.ejs', {
                    title: 'NO SELV',
                    user: req.user,
                    users_found: users_found
                })
            });

        });



//retreiving password

    app.get('/retrieve_pass', function (req, res) {
        res.render('retreiving_password', {
            title: 'NO SELV',
            error: req.flash('error')
        });
    });
    app.post('/retrieve_pass', function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        req.flash('error', 'Your email is not registered for any account @ noSelv!!');
                        return res.redirect('/retrieve_pass');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var mailOptions = {
                    to: user.email,
                    from: 'noSelv.com',
                    subject: 'noSelv Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('error', 'An email has been sent to you email for resetting password.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/retrieve_pass');
        });
    });

    app.get('/reset_password', function(req, res){
        email = req.flash('email');
       email = email[0];
        res.render('reset_pass.ejs',{
            title: 'NO SELV',
            email: email
        })
    });

    app.get('/forgot_password', function(req, res){
        res.render('forgot_password.ejs',{
            title: 'NO SELV'
        })
    });

    app.get('/reset/:token', function(req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot_password');
            }
            var email = req.flash('email', user.email);
            res.redirect('/reset_password');

        });
    });

    app.post('/reset_password', function(req, res) {
       var email = req.body.email;
       user =new User();
       var  pass = user.generatHarsh(req.body.password);
       User.update({'email': email}, {$set: {'password': pass}},function(err){
           if(err)
               throw err;
           res.redirect('/');
       });
    }
    );

        //signup
    app.get('/signup', function(req, res) {
       var flash_message = req.flash('signupMessage');
       if(flash_message.length == 1) {
           res.render('signup.ejs', {
               title: 'NO SELV',
               signupMessage: flash_message[0],
               code_sent: '',
               email: ''
           });
       }else {
// send mail with defined transport object
           var email_to = flash_message[1];
           var mailOptions = {
               from: 'noSelv.com', // sender address
               to: email_to, // list of receivers
               subject: 'Verification code for your noSelv account ✔', // Subject line
               text: 'Your noSelv email verification code is ?', // plain text body
               html: 'Your noSelv email verification code is <Strong>' + flash_message[2] + '</Strong> Login in order to activate account with the code.' // html body
           };
           transporter.sendMail(mailOptions, function (error) {
               if (error) {
                   return console.log(error);
               }
               res.render('signup.ejs', {
                   title: 'NO SELV',
                   signupMessage: flash_message[0],
                   code_sent: flash_message[2],
                   email: email_to
               });
           });
       }

    });

    app.get('./logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/signup', passport.authenticate('local-signup',{
        successRedirect: '/signup',
        failureRedirect: '/signup',
        failureFlash: true
    }));
//loging out
    app.get('/logout',function(req, res){
        delete req.session.authenticated;
        req.logout();
        res.redirect('/');
    });

    //facebook
    app.get('/auth/facebook',passport.authenticate('facebook', {scope: ['email']}));
    app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/' }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/home');
        });
    //google
    app.get('/auth/google',passport.authenticate('google', {scope: ['profile','email']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res){
            // Successful authentication, redirect home.
            res.redirect('/home');
        });


};
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}
