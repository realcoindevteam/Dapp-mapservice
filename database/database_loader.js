var mongoose = require('mongoose');

var mysql = require('mysql');
var crypto = require('crypto');

var database = {};

database.init = function(app, config) {
    console.log('database loader init called');
 
    var pool = mysql.createPool({
        connectionLimit:10,
        host: config.db_url,
        user:config.db_id,
        password:config.db_password,
        database:'testdb',
        debug:false
    });

    pool.getConnection(function(err, conn) {
        if(err) {
            console.log('database init getConnection error');
            conn.release();
            return;
        }

        let createAssets = 'CREATE TABLE IF NOT EXISTS assets2('
            + 'id INT NOT NULL AUTO_INCREMENT,'
            + 'PRIMARY KEY(id),'
            + 'name VARCHAR(30),'
            + 'address VARCHAR(255),'
            + 'token VARCHAR(255),'
            + 'latitude DECIMAL(9,6),'
            + 'longitude DECIMAL(9,6),'
            + 'price VARCHAR(255)'
            + ')';

        conn.query(createAssets, function(err) {
            console.log('query -> ' + createAssets);
            if (err) throw err;
        });
    });

    var encryptPassword = function (plainText, inSalt) {
        console.log('encryptPassword called ' + crypto + ', ' + inSalt + ', ' + this.salt);
        if (inSalt) {
            console.log('encryptedPasswrod 1');
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            console.log('encryptedPasswrod 2');
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    };
    
    app.set('pool', pool);
    app.set('encryptPassword', encryptPassword);
}

function connect(app, config) {
    console.log('database loader connect called');

    mongoose.Promise = global.Promise;
    mongoose.connect(config.db_url);
    database.db = mongoose.connection;

    database.db.on('open', function() {
        console.log('Database connection is created');
        createSchema(app, config);
    });

    database.db.on('disconnected', function() {
        console.log('Database connection disconnected');
    });

    database.db.on('error', console.error.bind(console, 'Database connection error'));
}

function createSchema(app, config) {
    console.log('count of schemas : ' + config.db_schemas.length);
    for(var i = 0; i < config.db_schemas.length; i++) {
        var curItem = config.db_schemas[i];
        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log('%s schema created', curItem.file);

        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log('%s model is defined.', curItem.collection);

        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('schema [%s], model [%s] created', curItem.schemaName, curItem.modelName);   
    }
    app.set('database', database);
}

module.exports = database;