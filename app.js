var express = require('express')
    , http = require('http')
    , path = require('path');

var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

var mongoose = require('mongoose');

var user = require('./routes/user');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var database;

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

router.route('/login').post(user.login);

app.use('/', router);

var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

function connectDB() {
    var databaseUrl = 'mongodb://localhost:27017/local';

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('open', function() {
        console.log('Database connection is created');
        createUserSchema(database);
    });

    database.on('disconnected', function() {
        console.log('Database connection disconnected');
    });

    database.on('error', console.error.bind(console, 'Database connection error'));

    app.set('database', database);
}

function createUserSchema(database) {
    database.UserSchema = require('./database/user_schema').createSchema(mongoose);

    database.UserModel = mongoose.model('users2', database.UserSchema);
    console.log('UserModel is defined.');
}

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('starting server. port : ' + app.get('port'));
    connectDB();
});


