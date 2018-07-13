var express = require('express')
    , http = require('http')
    , path = require('path');

var bodyParser = require('body-parser')
    , static = require('serve-static')
    , cookieParser = require('cookie-parser')
    , expressSession = require('express-session')
    , expressErrorHandler = require('express-error-handler');

var passport = require('passport');
var flash = require('connect-flash');

var config = require('./config/config');
var databaseLoader = require('./database/database_loader');

var app = express();

var schedule = require('node-schedule');
var winston = require('winston');
var moment = require('moment');

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'info',
            timestamp:function() {
                return moment().format("YYYY-MM-DD HH:mm:ss");
            },
            filename: 'batchjob.log',
            json:false
        })
    ]
});

var j = schedule.scheduleJob('*/1 * * * *', function() {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ' batch function called');
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + ' batch function called');
})

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

var configPassport = require('./config/config_passport');
configPassport(app, passport);

var router = express.Router();
//route_loader.init(app, router);

var userPassport = require('./routes/user_passport');
userPassport(router, passport);

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


