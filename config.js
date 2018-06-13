var config = {
    server_port: 3000,
    db_url: 'mongodb://localhost:27017/local',
    db_schemas: [
        {file:'./user_schema', collection:'users2', schemaName:'UserSchema', modelName:'UserModel'}
    ],
    route_info: [
        {file:'./user', path:'/login', method:'login', type:'post'}
    ]
};

module.exports = config;