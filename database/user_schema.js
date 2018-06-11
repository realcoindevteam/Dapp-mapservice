var crypte = require('crypto');

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

    UserSchema.virtual('password')
        .set(function (password) {
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
            console.log('virtual password saved : ' + this.hashed_password);
        });

    UserSchema.method('encryptPassword', function (plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    UserSchema.method('authenticate', function (plainText, inSalt, hash_password) {
        if (inSalt) {
            console.log('authenticate called.');
            return this.encryptPassword(plainText, inSalt) === hashed_passed;
        } else {
            console.log('authenticate called.');
            return this.encryptPassword(plainText) === hashed_passed;
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