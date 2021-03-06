var User = require('../models/user');
var Rate = require('../models/rate');
var Participant = require('../models/participant-list')
var sequelize = require('sequelize');
var seq = require('../models/seq');


exports.getUser = function (req, res, promise) {
    console.log(req.body);

    User.findOne({
        attributes: { exclude: ['password', 'salt'] },
        where:{
            id: req.body.userId
        }
    }).then(function (user) {
        console.log(user.dataValues);
        res.send({
            errorMsg: null,
            user: user
        });
        promise.resolve();
    }).catch(function (e) {
        promise.reject();
    });
    return promise;
};

exports.editProfile = function (req, res, promise) {
    console.log(req.body);

    var update = {};

    update.firstName = (req.body.firstName !== null && req.body.firstName !== "") ? req.body.firstName : sequelize.literal('"firstName"');
    update.lastName = (req.body.lastName !== null && req.body.lastName !== "") ? req.body.lastName : sequelize.literal('"lastName"');
    update.nickName = (req.body.nickName !== null && req.body.nickName !== "") ? req.body.nickName : sequelize.literal('"nickName"');
    update.proPic = (req.body.proPic !== null && req.body.proPic !== "") ? req.body.proPic : sequelize.literal('"proPic"');
    update.phone = (req.body.phone !== null && req.body.phone !== "") ? req.body.phone : sequelize.literal('"phone"');
    update.description = (req.body.description !== null && req.body.description !== "") ? req.body.description : sequelize.literal('description');

    User.update(update, { where: {id: req.body.id}})
        .then(function () {
            res.send({
                errorMsg: null
            });
            promise.resolve();
        })
        .catch(function () {
            promise.reject();
        });
    return promise;
};

exports.postRate = function (req, res, promise) {
    console.log(req.body);

    if (req.body.extraversion > 3 || req.body.extraversion < -3){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.agreeableness > 3 || req.body.agreeableness < -3){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.conscientiousness > 3 || req.body.conscientiousness < -3){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.neuroticism > 2 || req.body.neuroticism < -2){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.openness > 3 || req.body.openness < -3){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    Participant.count({
        where: {userId: req.body.userId}
    }).then(function (counts) {
        var c;
        if (counts > 10)
            c = 10;
        else
            c = counts;
        return Rate.create({
            extraversion: req.body.extraversion*c,
            agreeableness: req.body.agreeableness*c,
            conscientiousness: req.body.conscientiousness*c,
            neuroticism: req.body.neuroticism*c,
            openness: req.body.openness*c,
            userId: req.body.userId,
            otherUserId: req.body.otherUserId,
            weight: c,
            eventId: req.body.eventId
        })
    }).then(function () {
        return Rate.count({where:{otherUserId: req.body.otherUserId}});
    }).then(function (counts) {
        if (counts > 5)
            return seq.query("SELECT SUM(b.extraversion) as e, SUM(b.agreeableness) as a, SUM(b.conscientiousness) as c, SUM(b.neuroticism) as n, SUM(b.openness) as o, SUM(b.weight) as w FROM Rate As b INNER JOIN (SELECT MAX(id) as tt FROM Rate GROUP BY otherUserId LIMIT 30) AS a ON b.id = a.tt");
        else
            return [null,null];
    }).spread(function(results, metadata) {
        if (results != null)
            return User.update({
                adjustmentExtraversionWeightedSum: results[0].e,
                adjustmentAgreeablenessWeightedSum: results[0].a,
                adjustmentConscientiousnessWeightedSum: results[0].c,
                adjustmentNeuroticismWeightedSum: results[0].n,
                adjustmentOpennessWeightedSum: results[0].o,
                adjustmentWeight: results[0].w,
                isSelfRated: true
            }, {where: {id: req.body.otherUserId }});
        else {
            return null;
        }
    }).then(function () {
        res.send({
            errorMsg: null
        })
    }).catch(function (e) {
        console.log('error: '+ e);
        promise.reject();
    });
    return promise;
};

exports.postSelfRate = function (req, res, promise) {
    console.log(req.body);

    User.update({
        selfExtraversion: req.body.extraversion,
        selfAgreeableness: req.body.agreeableness,
        selfConscientiousness: req.body.conscientiousness,
        selfNeuroticism: req.body.neuroticism,
        selfOpenness: req.body.openness,
        isSelfRated: true
    },
        {where: {id: req.body.userId}
    }).then(function () {
        res.send({
            errorMsg: null
        })
    }).catch(function (e) {
        promise.reject();
    });
    return promise;

};