var User = require('../models/user');
var crypto = require('crypto');
var hasher = require('../lib/hasher');

exports.register = function (req, res, promise) {
    /*
    req.body = {
     username:
     email:
     password:
    }
     */

    var respond = {
        err: null
    };

    if(req.body.username == null || req.body.username == undefined || req.body.username == '') {
        promise.reject('usernameShouldNotBeEmpty');
        return promise;
    }

    if(req.body.email == null || req.body.email == undefined || req.body.email == '') {
        promise.reject('emailShouldNotBeEmpty');
        return promise;
    }

    if(req.body.password == null || req.body.password == undefined || req.body.password == '') {
        promise.reject('passwordShouldNotBeEmpty');
        return promise;
    }

    if(req.body.username.match(/^\w{5,20}$/) == null) {
        promise.reject('usernameWrongFormat');
        return promise;
    }

    if(req.body.email.match(/.+@.+/) == null) {
        promise.reject('emailWrongFormat');
        return promise;
    }

    if(req.body.password.match(/^.{8,50}$/) == null) {
        promise.reject('passwordWrongFormat');
        return promise;
    }

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: hasher.hash(req.body.password, hasher.hashVal.dbPw),
        privacy: 'public'
    }).then(function (user) {
        if (user) {
            promise.resolve();
            res.send(respond);
        } else {
            promise.reject();
        }
    });
    return promise;
};

