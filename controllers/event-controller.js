var Event = require('../models/event');
var User = require('../models/user');
var Participation = require('../models/participant-list');
var crypto = require('crypto');
var hasher = require('../lib/hasher');
var sequelize = require('sequelize');

exports.pushEvent = function (req, res, promise) {
    Event.create({
        holderId: req.body.holderId,
        name: req.body.name,
        place: req.body.place,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        description: req.body.description,
        deadlineTime: sequelize.fn('STR_TO_DATE', req.body.deadlineTime, '%d/%m %H:%i'),
        startTime: sequelize.fn('STR_TO_DATE', req.body.startTime, '%d/%m %H:%i'),
        minPpl: req.body.minPpl,
        maxPpl: req.body.maxPpl
    })
};

exports.getEvent = function (req, res, promise) {

    console.log(req.body);

    Event.findOne({
        attributes: {
            include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%d/%m %H:%i'), 'deadlineTime_formated'],
                [sequelize.fn('date_format', sequelize.col('startTime'), '%d/%m %H:%i'), 'startTime_formated']]
        },
        include: [
            { model: User, as: 'holder', attributes: ['userName']},
            { model: User, as: 'participantList', attributes: ['userName']}
        ],
        where: {id: req.body.id}
    }).then(function (event) {
        console.log(JSON.stringify(event));
        res.send(event);
        promise.resolve();
    });
    return promise;
};

exports.getEvents = function (req, res, promise) {
    const latPerKilo = 0.009009;
    const lngPerKilo = 0.011764;

    console.log(req.body);

    if (req.body.latitude == null || req.body.latitude == undefined) {
        promise.reject(new Error('latitudeShouldNotBeEmpty'));
        return promise;
    }

    if (req.body.longitude == null || req.body.longitude == undefined) {
        promise.reject(new Error('longitudeShouldNotBeEmpty'));
        return promise;
    }

    if (req.body.latitude > 90 || req.body.latitude < -90) {
        promise.reject(new Error('latitudeOutOfRange'));
        return promise;
    }

    if (req.body.longitude > 180 || req.body.longitude < -180) {
        promise.reject(new Error('longitudeOutOfRange'));
        return promise;
    }

    if (req.body.mode > 3 || req.body.mode < 1) {
        promise.reject(new Error('modeNotExist'));
        return promise;
    }

    if (req.body.mode == 1) {
        Event.findAll({
            attributes: {
                include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%d/%m %H:%i'), 'deadlineTime_formated'],
                [sequelize.fn('date_format', sequelize.col('startTime'), '%d/%m %H:%i'), 'startTime_formated']]
            },
            include: [{ model: User, as: 'holder', attributes: ['userName']}],
            where: {
                // todo fix range issue in pole??
                latitude: {$between: [req.body.latitude - 50 * latPerKilo, req.body.latitude + 50 * latPerKilo]},
                longitude: {$between: [req.body.longitude - 50 * lngPerKilo, req.body.longitude + 50 * lngPerKilo]},
                deadlineTime: {$gt: Date.now()}
            }
        }).then(function (events) {
            res.send({
                errorMsg: null,
                data: events
            });
            promise.resolve();
        }).catch(function (e) {
            promise.reject(new Error(e));
        })
    } else if (req.body.mode == 2) {  // for history
        Event.findAll({
            attributes: {
                include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%d/%m %H:%i'), 'deadlineTime_formated'],
                    [sequelize.fn('date_format', sequelize.col('startTime'), '%d/%m %H:%i'), 'startTime_formated']]
            },
            include: [
                { model: User, as: 'holder', attributes: ['userName']},
                { model: User, as: 'participantList', attributes: ['userName'], where: {id: req.body.userId}}],
            where: {
                startTime: {$lt: Date.now()}
            }
        }).then(function (events) {
            console.log(JSON.stringify(events));
            res.send({
                errorMsg: null,
                data: events
            });
            promise.resolve();
        }).catch(function (e) {
            promise.reject(new Error(e));
        })
    } else if (req.body.mode == 3) {
        Event.findAll({
            attributes: {
                include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%d/%m %H:%i'), 'deadlineTime_formated'],
                    [sequelize.fn('date_format', sequelize.col('startTime'), '%d/%m %H:%i'), 'startTime_formated']]
            },
            include: [
                { model: User, as: 'holder', attributes: ['userName']},
                { model: User, as: 'participantList', attributes: ['userName'], where: {id: req.body.userId}}],
            where: {
                startTime: {$gt: Date.now()}
            }
        }).then(function (events) {
            console.log(JSON.stringify(events));
            res.send({
                errorMsg: null,
                data: events
            });
            promise.resolve();
        }).catch(function (e) {
            promise.reject(new Error(e));
        })
    }
    return promise;
};