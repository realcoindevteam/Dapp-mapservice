var mockupData = require('../test/mockup_data');

module.exports = function (router, passport) {
    console.log('user_passport called');

    router.route('/').get(function (req, res) {
        console.log('/ routing called');

        res.redirect('/profile');
    });

    router.route('/login').get(function (req, res) {
        console.log('/login get routing called : ' + req.user);
        res.redirect('/login.html');
        //   res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect: '/loginsuccess',
        failureRedirect: '/loginfailed',
        failureFlash: true
    }));

    router.route('/loginsuccess').get(function (req, res) {
        console.log('/loginsuccess get routing called');
        res.send('<p>login success<br><a href="/profile">my page 로 이동</a></p>');
    });

    router.route('/loginfailed').get(function (req, res) {
        console.log('loginfailed get routing called');
        res.send('<p>login failed</p>');
    });

    router.route('/signup').get(function (req, res) {
        console.log('/singup get routing called');

        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.route('/map').get(function (req, res) {
        var paramName = req.query.name;
        var paramAddress = req.query.address;
        var paramLat = req.query.lat;
        var paramLng = req.query.lng;

        if (!paramLat || !paramLng) {
            paramLat = 37.5326;
            paramLng = 127.024612;
        }
        console.log('/map called  :' + paramName + ', ' + paramAddress + ', ' + paramLat + ', ' + paramLng);
        res.render('map.ejs', { name: paramName, address: paramAddress, lat: paramLat, lng: paramLng });
    });

    router.route('/saveassets1').post(function (req, res) {
        var paramName = req.body.name || req.query.name;
        var paramToken = req.body.token || req.query.token;
        var paramLat = req.body.lat || req.query.lat;
        var paramLng = req.body.lng || req.query.lng;

        console.log('name : ' + paramName + ', ' + paramToken + ', ' + paramLat + ', ' + paramLng);
        console.dir(req.body);
        res.send({ result: false });
    });

    router.route('/saveassets').post(function (req, res) {
        console.log('/saveassets post routing called');

        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.redirect('/login');
        } else {
            console.log('사용자 인증된 상태임.');
            var paramName = req.body.name;
            var paramToken = req.body.token;
            var paramLat = req.body.lat;
            var paramLng = req.body.lng;
            var paramAddress = req.body.address;
            var paramPrice = req.body.price;

            console.log('save value name -> ' + paramName + ', token -> ' + paramToken + ', lat -> ' + paramLat + ', lng -> ' + paramLng
                    + ', address -> ' + paramAddress + ', price -> ' + paramPrice);

            var pool = req.app.get('pool');

            if (!paramName || !paramToken || !paramLat || !paramLng || !paramAddress || !paramPrice) {
                res.send({ result: false, msg: '모든 항목을 입력하세요.' });
                return;
            }

            pool.getConnection(function (err, conn) {
                if (err) {
                    if (conn) {
                        conn.release();
                    }
                    res.send({ result: false, msg: '데이터베이스 연결실패.' });
                    return;
                }

                var data = { name: paramName, token: paramToken, latitude: paramLat, longitude: paramLng, address: paramAddress, price: paramPrice };
                var exec = conn.query('insert into assets2 set ?', data, function (err, result) {
                    conn.release();

                    if (err) {
                        console.log('asset insert error');
                        res.send({ result: false, msg: '저장 실패.' });
                        return;
                    }

                    console.log('실행된 SQL -> ' + exec.sql);
                    res.send({ result: true, msg: '저장 성공.' });
                });
            });
        }
    });

    router.route('/profile').get(function (req, res) {
        console.log('/profile get routing called');

        console.log('req.user instance');
        // console.dir(req.user);



        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.redirect('/login');
        } else {
            console.log('사용자 인증된 상태임.');

            var userInfo;
            //var assetList = mockupData.assetList;
            var tablename = 'assets';

            var paramLat = req.body.lat || req.query.lat;
            var paramLng = req.body.lng || req.query.lng;

            console.log('profile lat -> ' + paramLat + ', lng -> ' + paramLng);
            var coordinate = {lat: paramLat, lng: paramLng};
            var isSetCoordinate = false;
            // if(paramLat && paramLng) {
            //     isSetCoordinate = true;
            //     res.render('admin.ejs', { coordinate: coordinate });
            //     return;
            // }

            var pool = req.app.get('pool');

            pool.getConnection(function (err, conn) {
                if (err) {
                    conn.release();
                    console.log('get profile connection error');
                    return;
                }

                var exec = conn.query("select * from assets2", [],
                    function (err, rows) {
                        conn.release();


                        if (err) {
                            console.log('select assets error');
                            return;
                        }

                        console.log('실행된 SQL -> ' + exec.sql);
                        var assetList = rows;

                        for (var i = 0; i < assetList.length; i++) {
                                     console.log('#' + i + ' -> ' + assetList[i].name + ', ' + assetList[i].address);
                           // console.dir(assetList[i]);
                        }

                        if (Array.isArray(req.user)) {
                            console.log('user is array');
                           // console.dir(req.user[0]);
                            userInfo = req.user[0];
                            //res.render('profile.ejs', { assetList: assetList });
                            res.render('admin.ejs', { assetList: assetList, coordinate: coordinate});
                        } else {
                            console.log('user is not array');
                          //  console.dir(req.user);
                            userInfo = req.user;
                            //res.render('profile.ejs', { user: req.user });
                        }
                    });

            });

            // console.log('user grade : ' + userInfo.grade);
            // if(userInfo.grade == 'admin') {
            //     res.render('admin.ejs', { assetList: assetList} );
            // } else {
            //     res.render('profile.ejs', { assetList: assetList} );
            // }
        }
    });

    router.route('/logout').get(function (req, res) {
        console.log('/logout get routing called');

        req.logout();
        res.redirect('/login');
    });

    router.route('/testadd').get(function (req, res) {
        console.log('/testadd get routing called');
        addUser(req.app.get('pool'), 'ranmaru520002@gmail.com', '1', 'james', '0', 'park', 'test1234', 'secret',
            function (err, addedUser) {
                if (err) {
                    console.log('에러 발생.');
                    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                    res.write('<h1><에러발생/h1>');
                    res.end();
                    return;
                }

                if (addedUser) {
                    console.dir(addedUser);
                }
            });
    });

    router.route('testlist').get(function (req, res) {
        console.log('/testlist get routing called');

    });
};

var addUser = function (pool, email, enabled, firstName, isUsing2FA, lastName, password, secret, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }

        console.log('데이터베이스 연결의 스레드 아이디 : ' + conn.threadId);

        var data = {
            id: 3, email: email, enabled: enabled, firstName: firstName, isUsing2FA: isUsing2FA,
            lastName: lastName, password: password, secret: secret
        };
        var exec = conn.query('insert into user_account set ?', data, function (err, result) {
            conn.release();
            console.log('실행된 SQL : ' + exec.sql);

            if (err) {
                console.log('SQL 실행 시 에러 발생.');
                callback(err, null);
                return;
            }

            callback(null, result);
        });
    });
};