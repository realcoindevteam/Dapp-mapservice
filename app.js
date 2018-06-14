var express = require('express')
    , http = require('http')
    , path = require('path');

var bodyParser = require('body-parser')
    , static = require('serve-static')
    , cookieParser = require('cookie-parser')
    , expressSession = require('express-session')
    , expressErrorHandler = require('express-error-handler');

var user = require('./routes/user');
var config = require('./config');
var databaseLoader = require('./database/database_loader');
var route_loader = require('./routes/route_loader');

var passport = require('passport');
var flash = require('connect-flash');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', config.server_port || 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var LocalStrategy = require('passport-local').Strategy;

passport.use('local-login', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, id, password, done) {
    console.log('local-login passport called : ' + id + ', ' + password);

    var database = app.get('database');
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
}));

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

var router = express.Router();
//route_loader.init(app, router);

router.route('/').get(function(req, res) {
    console.log('/ routing called');

    res.render('index.ejs');
});

router.route('/login').get(function(req, res) {
    console.log('/login get routing called');

    res.render('login.ejs', {message: req.flash('loginMessage')});
});

router.route('/login').post(passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

router.route('/profile').get(function(req, res) {
    console.log('/profile get routing called');

    console.log('req.user instance');
    console.dir(req.user);

    if(!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/login');
    } else {
        console.log('사용자 인증된 상태임.');

        if(Array.isArray(req.user)) {
            res.render('profile.ejs', {user: req.user[0]._doc});
        } else {
            res.render('profile.ejs', {user: req.user});
        }
    }
});

router.route('/logout').get(function(req, res) {
    console.log('/logout get routing called');

    req.logout();
    res.redirect('/login');
});

app.use('/', router);

var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('starting server. port : ' + app.get('port'));
    databaseLoader.init(app, config);
});


