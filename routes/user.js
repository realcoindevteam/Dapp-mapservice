var authUser = function (db, id, password, callback) {
    db.UserModel.findById(id, function (err, results) {
        if (err) {
            callback(err, null);
            return;
        }

        if (results.length > 0) {
            if (results[0]._doc.password === password) {
                console.log('match password');
                callback(null, results);
            } else {
                console.log('mismatch password');
                callback(null, null);
            }
        } else {
            console.log('mismatch user');
            callback(null, null);
        }
    });
};

var login = function (req, res) {
    var paramId = req.body.id;
    var paramPassword = req.body.password;
    var paramName = req.body.name;

    console.log('/process/login router called ..   params : ' + paramId + ', ' + paramPassword + ', ' + paramName);

    var database = req.app.get('database');

    authUser(database, paramId, paramPassword, function (err, docs) {
        if (err) {
            console.log('Database error');
            res.writeHead(200, {
                "Content-Type": "text/html;charset=utf8"
            });
            res.write('<h3>데이터베이스 에러</h3>');
            res.end();
        }

        if (docs) {
            console.log('login success');
            res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
            var context = {
                userid: paramId,
                username: docs[0].name
            };
            req.app.render('login_success', context, function(err, html) {
                if(err) {
                    console.err('view rendering error : ' + err.stack);
                    res.writeHead(200, {
                        "Content-Type": "text/html;charset=utf8"
                    });
                    res.write('<h3>뷰 렌더링 중 에러 발생/h3>');
                    res.write('<br><p>' + err.stack + '</p>');
                    res.end();
                    return;
                }

                res.end(html);
            });
        } else {
            console.log('login failed');
            res.writeHead(200, {
                "Content-Type": "text/html;charset=utf8"
            });
            res.write('<h3>로그인 실패</h3>');
            res.write('<div><p>일치하는 사용자가 없습니다.</p></div>');
            res.end();
        }
    });
};

module.exports.login = login;