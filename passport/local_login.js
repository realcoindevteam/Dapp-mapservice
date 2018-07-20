var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    console.log('local-login passport called : ' + email + ', ' + password);

    var pool = req.app.get('pool');
    var encryptPassword = req.app.get('encryptPassword');

    pool.getConnection(function(err, conn) {
        if(err) {
            if(conn) {
                conn.release();
            }

            callback(err, null);
            return;
        }

        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        var tablename = 'admin_account';
        var columns = ['email', 'last_name', 'password']
        var exec = conn.query("select ?? from ?? where email = ?", [columns, tablename, email], 
        function(err, rows) {
            conn.release();
            console.log('실행된 SQL : ' + exec.sql);

            if(err) {
                return done(err);
            }

            console.log('쿼리 성공');
            console.dir(rows);

            if(!rows[0]) {
                console.log('there is no user ' + email);
                return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
            }

            console.log('email -> ' + email + ', rows.email -> ' + rows[0].email + ', result -> ' + (email == rows[0].email));
            console.log('password -> ' + password + ', rows.password -> ' + rows[0].password + ', result -> ' + (password == rows[0].password));

            var authenticated = (email == rows[0].email && password == rows[0].password);
            console.log('encrypted password -> ' + encryptPassword(password, Math.round((new Date().valueOf() * Math.random())) + ''));
            if(!authenticated) {
                console.log('password does not match');
                return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
            }

            console.log('authentication completed');
            return done(null, rows);

        });
    });

    // var database = req.app.get('database');
    // database.UserModel.findOne({'id':id}, function(err, user) {
    //     if(err) {
    //         return done(err);
    //     }

        
    //     if(!user) {
    //         console.log('there is no user ' + id);
    //         return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
    //     }

    //     var authenicated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
    //     if (!authenicated) {
    //         console.log('password does not match');
    //         return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
    //     }

    //     console.log('authentication complete');
    //     console.dir(user);
    //     return done(null, user);
    // });
});