var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../routes/models/User.js');
var configAuth =  require('./auth');
module.exports = function(passport) {
    //serializing the data
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    //local signup
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },function(req, username, password, done) {
        process.nextTick(function () {
            User.findOne({'user_name': username}, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'The username is already registered!!'));
                } else {
                    var newUser = new User();
                    newUser.email = req.body.email;
                    User.findOne({'email': newUser.email}, function (err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'The email is already registered!!'));
                        } else {
                            var newUser = new User();
                            random_number =Math.floor((Math.random())*(999999-100000))+100000;
                            newUser.ids = '';
                            newUser.user_name = username;
                            newUser.password = newUser.generatHarsh(password);
                            newUser.first_name = req.body.first_name;
                            newUser.last_name = req.body.last_name;
                            newUser.status = random_number;
                            newUser.email = req.body.email;
                            newUser.profile_pic = 'images/bigAvatar.jpg';
                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser,
                                    req.flash('signupMessage', ['A verification code has been sent to your email for confirmation !!!',newUser.email,newUser.status])
                                );

                            })
                        }
                    })
                }
            })
        })
    }));
    //local login
    passport.use('local-login', new LocalStrategy({

            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password,done) {
            process.nextTick(function(){
                if(password.length ==6){
                    User.findOne({$or: [{'user_name': username}, {'email': username}]}, function (err, user) {
                        if (err){
                            return done(err);}
                            else {
                            User.update({'email': username},{$set:{'status': 'active'}},function (err) {
                                if(err)
                                    throw err;
                                return done(null, user);
                            });

                        }
                    });
                }else {
                    User.findOne({$or: [{'user_name': username}, {'email': username}]}, function (err, user) {
                        if (err)
                            return done(err);

                        if (!user)
                            return done(null, false, req.flash('loginMessage', 'No user found. Please sign up if you have no account!!'));

                        if (!user.validPassword(password))
                            return done(null, false, req.flash('loginMessage', ' Oops! Wrong username/email password combination!!!.'));
                        if(user){
                            if(user.status != 'active'){
                                return done(null, false, req.flash('loginMessage', ['A verification code had been sent to your email for confirmation !!!',user.email,user.status]));
                            }else{
                                return done(null, user);
                            }
                        }

                    });
                }
            });
        }));
    //facebook login
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientId,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackUrl,
            profileFields: ['id','photos', 'emails','displayName']
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({ 'ids': profile.id }, function (err, user) {
                    if(err)
                        return done(err);
                    if(user)
                        return done(err, user);
                    else{
                        var newUser = new User();
                        var all_names =  profile.displayName.split(" ");
                        var firstname = all_names[0];
                        var lastname = all_names[1];
                        newUser.ids =  profile.id;
                        newUser.user_name = accessToken;
                        newUser.token = accessToken;
                        newUser.first_name = firstname;
                        newUser.last_name = lastname;
                        newUser.email = profile.emails[0].value;
                        newUser.save(function (err) {
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            })
        }
    ));
    //google
    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientId,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackUrl
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({ 'ids': profile.id }, function (err, user) {
                    if(err)
                        return done(err);
                    if(user)
                        return done(err, user);
                    else{
                        var newUser = new User();
                        var all_names =  profile.displayName.split(" ");
                        var firstname = all_names[0];
                        var lastname = all_names[1];
                        newUser.ids =  profile.id;
                        newUser.user_name = accessToken;
                        newUser.token = accessToken;
                        newUser.first_name = firstname;
                        newUser.last_name = lastname;
                        newUser.email = profile.emails[0].value;
                        newUser.save(function (err) {
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            })
        }
    ));


};
