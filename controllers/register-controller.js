var User = require('../models/user');
var crypto = require('crypto');
var hasher = require('../lib/hasher');
var admin = require("firebase-admin");
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
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
        isSuccessful: false,
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
            userName: req.body.userName
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
    }).then(function(){
        //firebase account create
        return admin.auth().createCustomToken(req.body.userName)
        .catch(function(e){
            throw e;
        })
    }).then(function(firebaseToken){
        console.log("Success create", firebaseToken);
        return User.create({
            userName: req.body.userName,
               email: req.body.email,
               password: hasher.hash(req.body.password, hasher.hashVal.dbPw),
               firstName: req.body.firstName,
               lastName: req.body.lastName,
               nickName: req.body.nickName,
               gender: req.body.gender,
               proPic: req.body.proPic,
               phone: req.body.phone,
               description: req.body.description,
               isSelfRated: false,
               selfExtraversion: 3,
               selfAgreeableness: 3,
               selfConscientiousness: 3,
               selfNeuroticism: 3,
               selfOpenness: 3,
               adjustmentExtraversionWeightedSum: 0,
               adjustmentAgreeablenessWeightedSum: 0,
               adjustmentConscientiousnessWeightedSum: 0,
               adjustmentNeuroticismWeightedSum: 0,
               adjustmentOpennessWeightedSum: 0,
               adjustmentWeight: 1,
               attendEventNum: 0,
               abcentEventNum: 0,
               holdEventNum: 0,
               msgToken: firebaseToken,
               level: 1
        })
    }).then(function (user) {
        if (user) {
            promise.resolve

        res.send({
            isSuccessful: true,
        errorMsg: null
        });
        } else {
            throw 'unableToAddUser';
        }
    }).catch(function (e) {
        if(e == 'SameEmailFound') {
            promise.resolve
        res.send({
            isSuccessful: false,
        errorMsg: 'SameEmailFound'
        });
    console.log('errorMsg sent: ' + e);
        } else if (e == 'SameUserFound') {
            promise.resolve
        res.send({
            isSuccessful: false,
            errorMsg: 'SameUserFound'
        });
    console.log('errorMsg sent: ' + e);
        } else {
            promise.resolve;
            console.log('unknown error: ' + e);
            res.send({
                isSuccessful: false,
                errorMsg: e
            });
        }
    });

    return promise;
};

exports.forgetPassword = function (req, res, promise){
    console.log(req.body);

    var respond = {
        errorMsg : null,
    }

    User.findOne({
        where:{
            email: req.body.email,
            //acType: [null, 0]
        }
    }
    ).then(function (entry){
        if(entry){
            var newPwd = 
                randomstring.generate( { length: 2, charset: 'alphabetic' })
                    + randomstring.generate({length: 2,charset: 'numeric'})
                    + randomstring.generate({length: 5,charset:'alphanumeric'})

            console.log('email found');
            var transport = nodemailer.createTransport({
                host:'smtp.mail.com',
                port:465 ,
                secure:true,
                auth:{
                    user: 'meetUsService@email.com',
                    pass: 'fypsucks'
                }
            });
            var mailOptions = {
                from: 'MeetUs <meetUsService@email.com>',
                to: req.body.email,
                subject: 'MeetUs reset password',
                text:'Dear Sir/Madam,\n\nYour password has been reset according to your request.\nYour new password is '+newPwd+'\n\nRegards,\nMeetUs'
            };
            transport.sendMail(mailOptions,function(error,info){
                if(error){
                    throw 'Mail server error';
                }else{
                    var hash = hasher.hash(newPwd, hasher.hashVal.dbPw);
                    entry.updateAttributes({ password: hash});
                }
            });
        }
        else{
            console.log('email not found');
        }
    }).then(function(){
        console.log(respond);
        res.send(respond);
        promise.resolve();
    }).catch(function(e){
        console.log(e)
        respond.errorMsg = "Server error(1)"
        res.send(respond)
        promise.resolve();
    });
    return promise;
};


