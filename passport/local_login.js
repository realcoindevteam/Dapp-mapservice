var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, id, password, done) {
    console.log('local-login passport called : ' + id + ', ' + password);

    var database = req.app.get('database');
    database.UserModel.findOne({'id':id}, function(err, user) {
        if(err) {
            return done(err);
        }

        if(!user) {
            console.log('there is no user ' + id);
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
        }

        var authenicated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        if (!authenicated) {
            console.log('password does not match');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }

        console.log('authentication complete');
        return done(null, user);
    });
});