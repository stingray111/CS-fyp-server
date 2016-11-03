var User = require('../models/user');
var LoginStatus = require('../models/login-status');
var crypto = require('crypto');
var hasher = require('../lib/hasher');

/*
   req.body = {
        usernameOrEMail,
        password,
        ip,
        platform
   }
 */

exports.login = function (req, res, promise) {

    if(req.body.usernameOrEmail == null || req.body.usernameOrEmail == undefined || req.body.usernameOrEmail == '') {
        promise.reject('usernameOrEmailShouldNotBeEmpty');
        return promise;
    }

    if(req.body.password == null || req.body.password == undefined || req.body.password == '') {
        promise.reject('passwordShouldNotBeEmpty');
        return promise;
    }

    if(req.body.ip == null || req.body.ip == undefined || req.body.ip == '') {
        promise.reject('ipShouldNotBeEmpty');
        return promise;
    }

    if(req.body.platform == null || req.body.platform == undefined || req.body.platform == '') {
        promise.reject('platformShouldNotBeEmpty');
        return promise;
    }

    if (req.body.ip.match(/^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/) == null) {
        promise.reject('wrongIpFormat');
        return promise;
    }

    if (req.body.platform != 'AND' && req.body.platform != 'IOS' && req.body.platform != 'WEB') {
        promise.reject('invalidPlatform');
        return promise;
    }

    var isUsername = req.body.usernameOrEmail.match(/.+@.+/) == null;
    var respond = {
        err: null,
        token: null
    };

    var findUser;

    if (isUsername) {
        // username to login
        findUser = User.findOne({where: {username: req.body.usernameOrEmail}})
            .then(function (entry) {
                if (!entry) {
                    respond.err = 'userNotfound';
                    throw 'userNotfound';
                }
                return Promise.resolve(entry);
            })
    } else {
        // email to login
        findUser = User.findOne({where: {email: req.body.usernameOrEmail}})
            .then(function (entry) {
                if (!entry) {
                    respond.err = 'userNotfound';
                    throw 'userNotfound';
                }
                return Promise.resolve(entry);
            })
    }

    findUser.then(function (entry) {
        // var hash = crypto.createHash('sha256').update(pwd).digest('base64'); //*****
        var hash = hasher.hash(req.body.password, hasher.hashVal.dbPw);
        if(entry.password != hash) {
            respond.err = 'passwordWrong';
            throw 'passwordWrong';
        }
        return Promise.resolve(entry)
    }).then(function (entry) {
        // var token = Date.now().toString() + req.body.ip + loginTokenSalt;
        // var tokenHash = crypto.createHash('sha256').update(token).digest('base64');
        var tokenHash = hasher.hash(Date.now().toString() + req.body.ip, hasher.hashVal.loginToken);
        return LoginStatus.create({
            id : tokenHash,
            userId: entry.id,
            ipaddr: req.body.ip,
            platform: req.body.platform
        })
    }).then(function (loginStatus) {
        respond.token = loginStatus.id;
        req.locals.testing = {
            token: loginStatus.id
        };
        res.send(respond);
        promise.resolve();
        console.log('login no problem')
    }).catch(function (e) {
        if (e == 'userNotfound' || e == 'passwordWrong') {
            res.send(respond);
            promise.resolve();
            console.log('err sent: ' + e);
        } else
            promise.reject(e);
    });
    return promise;
};

exports.logout = function (req, res, promise) {
    LoginStatus.destroy({where: {id: req.locals.loginStatus.id}})
        .then(function (affectedRows) {
            if (affectedRows !== 1)
                throw 'no such token';
            promise.resolve();
            res.send({
                err: null
            });
        }).catch(promise.reject);
    return promise;
};
