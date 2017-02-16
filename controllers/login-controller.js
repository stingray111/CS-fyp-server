var User = require('../models/user');
var LoginStatus = require('../models/login-status');
var crypto = require('crypto');
var hasher = require('../lib/hasher');

/*
   req.body = {
        usernameOrEMail,
        password,
        UUID,
        platform
   }
 */

exports.login = function (req, res, promise) {

    console.log(req.body);

    if(req.body.usernameOrEmail == null || req.body.usernameOrEmail == undefined || req.body.usernameOrEmail == '') {
        promise.reject(new Error('usernameOrEmailShouldNotBeEmpty'));
        return promise;
    }

    if(req.body.password == null || req.body.password == undefined || req.body.password == '') {
        promise.reject(new Error('passwordShouldNotBeEmpty'));
        return promise;
    }

    if(req.body.UUID == null || req.body.UUID == undefined || req.body.UUID == '') {
        promise.reject(new Error('UUIDShouldNotBeEmpty'));
        return promise;
    }

    if(req.body.platform == null || req.body.platform == undefined || req.body.platform == '') {
        promise.reject(new Error('platformShouldNotBeEmpty'));
        return promise;
    }

    // todo check UUID format
    // if (req.body.UUID.match(/^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/) == null) {
    //     promise.reject('wrongIpFormat');
    //     return promise;
    // }

    if (req.body.platform != 'Android' && req.body.platform != 'IOS' && req.body.platform != 'WEB') {
        promise.reject(new Error('invalidPlatform'));
        return promise;
    }

    var isUsername = req.body.usernameOrEmail.match(/.+@.+/) == null;

    var respond = {
        isSuccessful: false,
        errorMsg: null,
        token: null,
        username: null
    };

    var findUser;

    if (isUsername) {
        // username to login
        findUser = User.findOne({where: {username: req.body.usernameOrEmail}})
            .then(function (entry) {
                if (!entry) {
                    respond.errorMsg = 'userNotfound';
                    throw 'userNotfound';
                }
                respond.username = entry.userName;
                return Promise.resolve(entry);
            })
    } else {
        // email to login
        findUser = User.findOne({where: {email: req.body.usernameOrEmail}})
            .then(function (entry) {
                if (!entry) {
                    respond.errorMsg = 'userNotfound';
                    throw 'userNotfound';
                }
                respond.username = entry.userName;
                return Promise.resolve(entry);
            })
    }

    findUser.then(function (entry) {
        // var hash = crypto.createHash('sha256').update(pwd).digest('base64'); //*****
        var hash = hasher.hash(req.body.password, hasher.hashVal.dbPw);
        if(entry.password != hash) {
            respond.errorMsg = 'passwordWrong';
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
            platform: req.body.platform,
	    msgToken: entry.msgToken
        })
    }).then(function (loginStatus) {
        respond.token = loginStatus.id;
        respond.userId = loginStatus.userId;
        respond.isSuccessful = true;
	respond.msgToken = loginStatus.msgToken;
        // req.locals.testing = {
        //     token: loginStatus.id
        // };
        res.send(respond);
        console.log(respond);
        promise.resolve();
    }).catch(function (e) {
        console.log(e);
        if (e == 'userNotfound' || e == 'passwordWrong') {
            respond.errorMsg = e;
            res.send(respond);
            promise.resolve();
            console.log('errorMsg sent: ' + e);
        } else
            promise.reject(new Error(e));
    });
    return promise;
};

exports.logout = function (req, res, promise) {
    LoginStatus.destroy({where: {id: req.body.token}})
        .then(function (affectedRows) {
            if (affectedRows !== 1)
                throw 'no such token';
            res.send({
                errorMsg: null
            });
            promise.resolve();
        }).catch(function(e) {
            promise.reject(e);
        });
    return promise;
};
