
var local_login = require('../passport/local_login');
var local_signup = require('../passport/local_signup');

module.exports = function(app, passport) {
    console.log('config_passport called');
    
    passport.serializeUser(function(user, done) {
        console.log('serializeUser called');
        console.dir(user);
    
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        console.log('deserializeUser called');
        console.dir(user);
    
        done(null, user);
    });

    passport.use('local-login', local_login);
    passport.use('local-signup', local_signup);
    console.log('passport strategy registered');
};