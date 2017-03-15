var User = require('../models/user');
var LoginStatus = require('../models/login-status');
var admin = require("firebase-admin");
var hasher = require('../lib/hasher');


exports.thirdPartySignIn = function(req,res,promise){
    console.log(req.body);
    //TODO: checking

    var respond = {
        isSuccessful: false,
        errorMsg: null,
        isSignIn: null,
        userId: null,
        username: null,
        token: null,
        msgToken: null,
        self: null
    }


    admin.auth().createCustomToken(req.body.userName)
    .then(function(firebaseToken){
        User.findOrCreate({
            where:{
                userName: req.body.userName
            },
            defaults:{
                email: req.body.email,
            password: null,
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
            }
        }).spread(function(entry, created){
            if(created){
                console.log('created');
                respond.isSignIn = false;
                return entry;
            }
            else{
                console.log('found');
                respond.isSignIn = true;
                return entry.updateAttributes({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    gender: req.body.gender,
                    proPic: req.body.proPic,
                    email: req.body.email
                });
            }
        }).then(function(entry){
            return entry.dataValues;
        }).then(function(entry){
            var tokenHash = hasher.hash(Date.now().toString() + req.body.ip, hasher.hashVal.loginToken);
            return [LoginStatus.create({
                id: tokenHash,
                userId: entry.id,
                ipaddr: req.body.ip,
                platform: req.body.platform,
                msgToken: entry.msgToken
            }),entry];
        }).spread(function(loginStatus, user){
            respond.self = user;
            respond.userId = user.id;
            respond.isSuccessful = true;
            respond.msgToken = user.msgToken;
            respond.token = loginStatus.id;
            respond.username = user.userName;

            console.log(respond);
            res.send(respond);
            promise.resolve();
        });
    });
    return promise;
}

