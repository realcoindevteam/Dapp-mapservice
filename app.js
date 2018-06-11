var express = require('express')
    , http = require('http')
    , path = require('path');

var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

var router = express.Router();

router.route('/login').post(function(req, res) {
    console.log('login route called');
    res.send('<h1>login router called</h1>');
});

app.use('/', router);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('starting server. port : ' + app.get('port'));
});


