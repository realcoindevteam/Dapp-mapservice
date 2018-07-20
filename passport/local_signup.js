var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    var paramName = req.body.name;
    var paramGrade = req.body.grade;
    console.log('local-signup passport called : ' + email + ', ' + password + ', ' + paramName + ', ' + paramGrade);

    var pool = req.app.get('pool');
    
    pool.getConnection(function(err, conn) {
        if(err) {
            if(conn) {
                conn.release();
            }

            callback(err, null);
            return;
        }

        let tablename = 'admin_account';
        let columns = ['email', 'first_name', 'password']
        var exec = conn.query('select ?? from ?? where email = ?', [columns, tablename, email]
        , function(err, rows) {
            
            console.log('실행된 SQL : ' + exec.sql);

            if(err) {
                return done(err);
            }

            console.log('쿼리 성공');
            console.dir(rows);

            var isExisted = false;

            if(!rows[0]) {
                console.log('사용자 없음');
            } else {
                isExisted = email == rows[0].email;
            }

            if(isExisted) {
                conn.release();
                console.log("이미 사용자가 존재 합니다.");
                return done(null, false, req.flash('signinMessage', "이미 사용자가 존재 합니다."));
            }

            let data = {email:email, password:password, last_name:paramName};
            let exec1 = conn.query('insert into admin_account set ?', data, function (err, result) {
                conn.release();
                console.log('insert 실행된 SQL -> ' + exec1.sql);
                if(err) {
                    console.log('admin insert error');
                    return done(null, flase, req.flash('signinMessage', "저장 실패"));
                }
                console.log('admin insert success');
                return done(null, rows);
            });
        });
    });

    // var database = req.app.get('database');
    // database.UserModel.findOne({'id':id}, function(err, user) {
    //     if(err) {
    //         console.log('error');
    //         return done(err);
    //     }

    //     if(user) {
    //         console.log('기존에 계정이 있습니다.' + id);
    //         return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
    //     } else {
    //         var user = new database.UserModel({'id':id, 'password':password, 'name':paramName, 'grade':paramGrade});
    //         user.save(function(err) {
    //             if(err) {
    //                 return done(null, false, req.flash('signupMessage', '사용자 정보 저장시 에러 발생'));
    //             }
    //             console.log('사용자 데이터 저장함.');
    //             return done(null, user);
    //         });
    //     }
    // });
});