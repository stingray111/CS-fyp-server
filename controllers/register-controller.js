var User = require('../models/user');
var crypto = require('crypto');
var hasher = require('../lib/hasher');

exports.register = function (req, res, promise) {
    /*
     req.body = {
     userName: required
     email: required
     password: required
     firstName:
     lastName:
     nickName:
     gender:
     proPic:
     phone:
     description:
     }
     */

    console.log(req.body);

    var respond = {
        isSucessful: false,
        errorMsg: null
    };

    // check empty required field
    if (req.body.userName == null || req.body.userName == undefined || req.body.userName == '') {
        promise.reject('usernameShouldNotBeEmpty');
        return promise;
    }

    if (req.body.email == null || req.body.email == undefined || req.body.email == '') {
        promise.reject('emailShouldNotBeEmpty');
        return promise;
    }

    if (req.body.password == null || req.body.password == undefined || req.body.password == '') {
        promise.reject('passwordShouldNotBeEmpty');
        return promise;
    }

    // check field format
    if (req.body.userName.match(/^\w{5,20}$/) == null) {
        promise.reject('usernameWrongFormat');
        return promise;
    }

    if (req.body.email.match(/.+@.+/) == null) {
        promise.reject('emailWrongFormat');
        return promise;
    }

    if (req.body.password.match(/^.{8,50}$/) == null) {
        promise.reject('passwordWrongFormat');
        return promise;
    }

    // todo: add checking other field

    User.findOne({
        where: {
            username: req.body.userName
        }
    }).then(function (entry) {
        if (entry)
            throw 'SameUserFound';
    }).then(function () {
        return User.findOne({
            where: {
                email: req.body.email
            }
        })
    }).then(function (entry) {
        if (entry)
            throw 'SameEmailFound';
        return User.create({
            userName: req.body.userName,
            email: req.body.email,
            password: hasher.hash(req.body.password, hasher.hashVal.dbPw),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            nickName: req.body.nickName,
            gender: req.body.isMale,
            proPic: req.body.proPic,
            phone: req.body.phone,
            description: req.body.description,
            level: 1
        })
    }).then(function (user) {
        if (user) {
            promise.resolve();
            res.send({
                isSucessful: true,
                errorMsg: null
            });
        } else {
            throw 'unableToAddUser';
        }
    }).catch(function (e) {
        if(e == 'SameEmailFound') {
            promise.resolve
            res.send({
                isSucessful: false,
                errorMsg: 'SameEmailFound'
            });
            console.log('errorMsg sent: ' + e);
        } else if (e == 'SameUserFound') {
            promise.resolve
            res.send({
                isSucessful: false,
                errorMsg: 'SameUserFound'
            });
            console.log('errorMsg sent: ' + e);
        } else {
            promise.reject(e);
        }
    });
    return promise;
};

