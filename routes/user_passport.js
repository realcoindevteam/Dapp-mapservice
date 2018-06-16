var mockupData = require('../test/mockup_data');

module.exports = function (router, passport) {
    console.log('user_passport called');

    router.route('/').get(function (req, res) {
        console.log('/ routing called');

        res.redirect('/profile');
    });

    router.route('/login').get(function (req, res) {
        console.log('/login get routing called');

        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.route('/signup').get(function (req, res) {
        console.log('/singup get routing called');

        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.route('/map').get(function(req, res) {
        var paramName = req.query.name;
        var paramAddress = req.query.address;
        var paramLat = req.query.lat;
        var paramLng = req.query.lng;
        console.log('/map called  :' + paramName + ', ' + paramAddress + ', ' + paramLat + ', ' + paramLng);
        res.render('map.ejs', {name:paramName, address:paramAddress, lat:paramLat, lng:paramLng});
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
            var assetList = mockupData.assetList;

            for(var i = 0; i < assetList.length; i++) {
                console.log('#' + i + ' -> ' + assetList[i].name + ', ' + assetList[i].address);
            }

            if (Array.isArray(req.user)) {
                console.log('user is array');
                console.dir(req.user[0]._doc);
                userInfo = req.user[0]._doc;
                //res.render('profile.ejs', { user: req.user[0]._doc });
            } else {
                console.log('user is not array');
                console.dir(req.user);
                userInfo = req.user;
                //res.render('profile.ejs', { user: req.user });
            }

            console.log('user grade : ' + userInfo.grade);
            if(userInfo.grade == 'admin') {
                res.render('admin.ejs', { assetList: assetList} );
            } else {
                res.render('profile.ejs', { assetList: assetList} );
            }
        }
    });

    router.route('/logout').get(function (req, res) {
        console.log('/logout get routing called');

        req.logout();
        res.redirect('/login');
    });
};