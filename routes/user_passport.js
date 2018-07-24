var mockupData = require('../test/mockup_data');

module.exports = function (router, passport) {
    console.log('user_passport called');

    router.route('/').get(function (req, res) {
        console.log('/ routing called');

        res.redirect('/profile');
    });

    router.route('/admin').get(function (req, res) {
        console.log('/admin called');
        res.redirect('/adminpage')
    });

    router.route('/login').get(function (req, res) {
        console.log('/login get routing called : ' + req.user);
        res.redirect('/login.html');
    });

    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect: '/admin',
        failureRedirect: '/loginfailed',
        failureFlash: true
    }));

    router.route('/loginsuccess').get(function (req, res) {
        console.log('/loginsuccess get routing called');
        res.send('<p>login success<br><a href="/adminpage">my page 로 이동</a></p>');
    });

    router.route('/loginfailed').get(function (req, res) {
        console.log('loginfailed get routing called');
        res.send('<p>login failed</p><a href="/login">돌아가기</a>');
    });

    router.route('/signup').get(function (req, res) {
        console.log('/singup get routing called');
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/signupsuccess',
        failureRedirect: '/signupfailed',
        failureFlash: true
    }));

    router.route('/signupsuccess').get(function (req, res) {
        console.log('/signupsuccess get routing called');
        res.send('<p>Sign up success<br><a href="/login">Login</a></p>');
    });

    router.route('/signupfailed').get(function (req, res) {
        console.log('signupfailed get routing called');
        res.send('<p>Sign up failed<br><a href="/signup">돌아가기</a></p>');
    });

    router.route('/map1').get(function (req, res) {
        res.render('map1.ejs', { lat: 37.532102, lng: 127.024440 });
    });

    router.route('/map').get(function (req, res) {
        console.log('/map route called ');
        var paramId = req.body.id || req.query.id;
        console.log('id -> ' + paramId);

        var pool = req.app.get('pool');
        pool.getConnection(function (err, conn) {
            if (err) {
                conn.release();
                console.log('get profile connection error');
                return;
            }

            var exec = conn.query("select * from assets", [],
                function (err, rows) {
                    conn.release();

                    if (err) {
                        console.log('select assets error');
                        return;
                    }

                    console.log('실행된 SQL -> ' + exec.sql);
                    var assetList = rows;

                    console.log('after stringify');
                    console.dir(assetList);

                    if (Array.isArray(req.user)) {
                        console.log('user is array');
                        // console.dir(req.user[0]);
                        userInfo = req.user[0];
                        res.render('map.ejs', { id: paramId, assetList: assetList });
                    } else {
                        console.log('user is not array');
                        userInfo = req.user;
                        res.render('map.ejs', { id: paramId, assetList: assetList });
                    }
                });
        });

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
                var exec = conn.query('insert into assets set ?', data, function (err, result) {
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
        var paramLat = req.body.lat || req.query.lat;
        var paramLng = req.body.lng || req.query.lng;

        console.log('profile lat -> ' + paramLat + ', lng -> ' + paramLng);
        var coordinate = { lat: paramLat, lng: paramLng };

        var pool = req.app.get('pool');

        pool.getConnection(function (err, conn) {
            if (err) {
                conn.release();
                console.log('get profile connection error');
                return;
            }

            var exec = conn.query("select * from assets", [],
                function (err, rows) {
                    conn.release();

                    if (err) {
                        console.log('select assets error');
                        res.send('<h3>자산 검색 에러<h3>');
                        return;
                    }

                    console.log('실행된 SQL -> ' + exec.sql);
                    var assetList = rows;

                    for (var i = 0; i < assetList.length; i++) {
                        console.log('#' + assetList[i].id + ' -> ' + assetList[i].name + ', ' + assetList[i].address);
                    }

                    res.render('profile.ejs', { assetList: assetList, coordinate: coordinate });
                });
        });
    });

    router.route('/adminpage').get(function (req, res) {
        console.log('/adminpage get routing called');

        var defaultPage = req.body.default || req.query.default;
        console.log('default page -> ' + defaultPage);

        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.redirect('/login');
        } else {
            console.log('사용자 인증된 상태임.');
            var userInfo;

            var paramLat = req.body.lat || req.query.lat;
            var paramLng = req.body.lng || req.query.lng;

            console.log('adminpage lat -> ' + paramLat + ', lng -> ' + paramLng);
            var coordinate = { lat: paramLat, lng: paramLng };

            var pool = req.app.get('pool');

            pool.getConnection(function (err, conn) {
                if (err) {
                    conn.release();
                    console.log('get profile connection error');
                    return;
                }

                var exec = conn.query("select * from assets", [],
                    function (err, rows) {
                        conn.release();

                        if (err) {
                            console.log('select assets error');
                            res.send('<h3>자산 검색 에러<h3>');
                            return;
                        }

                        console.log('실행된 SQL -> ' + exec.sql);
                        var assetList = rows;

                        for (var i = 0; i < assetList.length; i++) {
                            console.log('#' + assetList[i].id + ' -> ' + assetList[i].name + ', ' + assetList[i].address);
                        }

                        if (Array.isArray(req.user)) {
                            console.log('user is array');
                            userInfo = req.user[0];
                            res.render('admin.ejs', { defaultPage: defaultPage, assetList: assetList, coordinate: coordinate });
                        } else {
                            console.log('user is not array');
                            userInfo = req.user;
                        }
                    });
            });
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
        var exec = conn.query('insert into admin_account set ?', data, function (err, result) {
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