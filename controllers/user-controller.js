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

exports.postRate = function (req, res, promise) {
    console.log(req.body);

    if (req.body.extraversion == null) {
        promise.reject(new Error('eIsNull'));
        return promise;
    }

    if (req.body.agreeableness == null) {
        promise.reject(new Error('aIsNull'));
        return promise;
    }

    if (req.body.conscientiousness == null) {
        promise.reject(new Error('cIsNull'));
        return promise;
    }

    if (req.body.neuroticism == null) {
        promise.reject(new Error('nIsNull'));
        return promise;
    }

    if (req.body.openness == null) {
        promise.reject(new Error('oIsNull'));
        return promise;
    }

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
            weight: c
        })
    }).then(function () {
        return seq.query("SELECT SUM(b.extraversion) as e, SUM(b.agreeableness) as a, SUM(b.conscientiousness) as c, SUM(b.neuroticism) as n, SUM(b.openness) as o, SUM(b.weight) as w FROM Rate As b INNER JOIN (SELECT MAX(id) as tt FROM Rate GROUP BY otherUserId LIMIT 10) AS a ON b.id = a.tt");
    }).spread(function(results, metadata) {
        console.log(results);
        return User.update({
            adjustmentExtraversionWeightedSum: results[0].e,
            adjustmentAgreeablenessWeightedSum: results[0].a,
            adjustmentConscientiousnessWeightedSum: results[0].c,
            adjustmentNeuroticismWeightedSum: results[0].n,
            adjustmentOpennessWeightedSum: results[0].o,
            adjustmentWeight: results[0].w,
            isSelfRated: true
        }, {where: {id: req.body.otherUserId }});
    }).then(function () {
        res.send({
            errorMsg: null
        })
    }).catch(function (e) {
        console.log(e);
        promise.reject();
    });
    return promise;
};

exports.postSelfRate = function (req, res, promise) {
    console.log(req.body);

    if (req.body.extraversion > 5 || req.body.extraversion < 1){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.agreeableness > 5 || req.body.agreeableness < 1){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.conscientiousness > 5 || req.body.conscientiousness < 1){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.neuroticism > 5 || req.body.neuroticism < 1){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

    if (req.body.openness > 5 || req.body.openness < 1){
        promise.reject(new Error('rateInvalid'));
        return promise;
    }

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