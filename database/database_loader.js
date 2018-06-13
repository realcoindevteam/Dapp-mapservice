var mongoose = require('mongoose');

var database = {};

database.init = function(app, config) {
    console.log('database loader init called');

    connect(app, config);
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