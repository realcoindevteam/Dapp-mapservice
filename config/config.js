var config = {
    server_port: 3000,
    db_url: 'ec2-13-125-246-91.ap-northeast-2.compute.amazonaws.com',
    db_id:'realcoin',
    db_password:'realcoin',
    db_schemas: [
        //{file:'./user_schema', collection:'users10', schemaName:'UserSchema', modelName:'UserModel'}
        {file:'./asset_schema', table:'assets'}
    ],
    route_info: [
        {file:'./user', path:'/login', method:'login', type:'post'}
    ]
};

module.exports = config;