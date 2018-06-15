var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, id, password, done) {
    var paramName = req.body.paramName;
    console.log('local-signup passport called : ' + id + ', ' + password + ', ' + paramName);

    var database = req.app.get('database');
    database.UserModel.findOne({'id':id}, function(err, user) {
        if(err) {
            console.log('error');
            return done(err);
        }

        if(user) {
            console.log('기존에 계정이 있습니다.' + id);
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
        } else {
            var user = new database.UserModel({'id':id, 'password':password, 'name':paramName});
            user.save(function(err) {
                if(err) {
                    return done(null, false, req.flash('signupMessage', '사용자 정보 저장시 에러 발생'));
                }
                console.log('사용자 데이터 저장함.');
                return done(null, user);
            });
        }

        // var authenicated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        // if (!authenicated) {
        //     console.log('password does not match');
        //     return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        // }

        // console.log('authentication complete');
        // return done(null, user);
    });
});