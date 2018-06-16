var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function (mongoose) {
    console.log('createSchema 호출됨.');
    var UserSchema = mongoose.Schema({
        id: {
            type: String,
            required: true,
            unique: true,
            default: ''
        },
        hashed_password: {
            type: String,
            required: true,
            default: ''
        },
        salt: {
            type: String,
            required: true
        },
        name: {
            type: String,
            index: 'hashed',
            default: ''
        },
        grade: {
            type: String,
            required: true,
            default: 'user'
        },
        age: {
            type: Number,
            default: -1
        },
        created_at: {
            type: Date,
            index: {
                unique: false
            },
            default: Date.now()
        },
        updated_at: {
            type: Date,
            index: {
                unique: false
            },
            default: Date.now()
        }
    });
    console.log('UserSchema 정의함.');

    UserSchema.path('id').validate(function(id) {
        return id.length;
    }, 'email column does not exist');

    UserSchema.virtual('password')
        .set(function (password) {
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
            console.log('virtual password saved : ' + this.hashed_password);
        });

    UserSchema.method('encryptPassword', function (plainText, inSalt) {
        console.log('encryptPassword called ' + crypto + ', ' + inSalt + ', ' + this.salt);
        if (inSalt) {
            console.log('encryptedPasswrod 1');
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            console.log('encryptedPasswrod 2');
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    UserSchema.method('authenticate', function (plainText, inSalt, hash_password) {
        if (inSalt) {
            console.log('authenticate called. : ' + this.encryptPassword(plainText, inSalt) + ', ' + hash_password);
            return this.encryptPassword(plainText, inSalt) === hash_password;
        } else {
            console.log('authenticate called.');
            return this.encryptPassword(plainText) === hash_password;
        }
    });

    UserSchema.method('makeSalt', function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });


    UserSchema.static('findById', function (id, callback) {
        return this.find({
            'id': id
        }, callback);
    });

    UserSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });

    return UserSchema;
};

module.exports = Schema;