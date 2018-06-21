var config = {
    server_port: 3000,
    db_url: 'mysqlinstance-cluster-1.cluster-c1q9sxwqtbiw.ap-northeast-2.rds.amazonaws.com',
    db_id:'root',
    db_password:'asdf1234',
    db_schemas: [
        //{file:'./user_schema', collection:'users10', schemaName:'UserSchema', modelName:'UserModel'}
        {file:'./asset_schema', table:'assets'}
    ],
    route_info: [
        {file:'./user', path:'/login', method:'login', type:'post'}
    ]
};

module.exports = config;