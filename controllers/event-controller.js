var Event = require('../models/event');
var User = require('../models/user');
var Participation = require('../models/participant-list');
var hasher = require('../lib/hasher');
var sequelize = require('sequelize');
var moment = require('moment');


exports.pushEvent = function (req, res, promise) {
    console.log(req.body);
    Event.create({
        holderId: req.body.holderId,
        name: req.body.name,
        place: req.body.place,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        description: req.body.description,
        deadlineTime: moment(req.body.eventDeadline, "YYYY-MM-DD HH:mm").toDate(),
        startTime: moment(req.body.eventStart, "YYYY-MM-DD HH:mm").toDate(),
        currentPpl: 0,
        minPpl: req.body.minPpl,
        maxPpl: req.body.maxPpl
    }).then(function (event) {
        res.send({
            errorMsg: null
        });
        promise.resolve();
    });
    return promise;
};

exports.getEvent = function (req, res, promise) {

    //todo validation

    Event.findOne({
        attributes: {
            include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%Y/%m/%d %H:%i'), 'deadlineTime_formated'],
                [sequelize.fn('date_format', sequelize.col('startTime'), '%Y/%m/%d %H:%i'), 'startTime_formated']]
        },
        include: [
            {model: User, as: 'holder', attributes: ['userName', 'id']},
            {model: User, as: 'participantList', attributes: ['userName', 'id']}
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
    var data = [];

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
                include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%Y/%m/%d %H:%i'), 'deadlineTime_formated'],
                    [sequelize.fn('date_format', sequelize.col('startTime'), '%Y/%m/%d %H:%i'), 'startTime_formated']]
            },
            include: [{model: User, as: 'holder', attributes: ['userName']}],
            where: {
                // todo fix range issue in pole??
                latitude: {$between: [req.body.latitude - 50 * latPerKilo, req.body.latitude + 50 * latPerKilo]},
                longitude: {$between: [req.body.longitude - 50 * lngPerKilo, req.body.longitude + 50 * lngPerKilo]},
                deadlineTime: {$gt: Date.now()}
            }
        }).then(function (events) {
            var temp = JSON.parse(JSON.stringify(events));
            res.send({
                errorMsg: null,
                data: temp
            });
            promise.resolve();
        }).catch(function (e) {
            promise.reject(new Error(e));
        })
    } else if (req.body.mode == 2) {  // for history
        Event.findAll({
            attributes: {
                include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%Y/%m/%d %H:%i'), 'deadlineTime_formated'],
                    [sequelize.fn('date_format', sequelize.col('startTime'), '%Y/%m/%d %H:%i'), 'startTime_formated']]
            },
            include: [
                {model: User, as: 'holder', attributes: ['userName', 'id']},
                {model: User, as: 'participantList', attributes: ['userName', 'id'], where: {id: req.body.userId}}],
            where: {
                startTime: {$lt: Date.now()}
            },
            raw: true
        }).then(function (events) {
            data = JSON.parse(JSON.stringify(events));
            return Event.findAll({
                attributes: {
                    include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%Y/%m/%d %H:%i'), 'deadlineTime_formated'],
                        [sequelize.fn('date_format', sequelize.col('startTime'), '%Y/%m/%d %H:%i'), 'startTime_formated']]
                },
                include: [
                    {model: User, as: 'holder', attributes: ['userName', 'id'], where: {id: req.body.userId}},
                    {model: User, as: 'participantList', attributes: ['userName', 'id']}],
                where: {
                    startTime: {$lt: Date.now()}
                }
            });
        }).then(function (events2) {
            Array.prototype.push.apply(data, JSON.parse(JSON.stringify(events2)));
            res.send({
                errorMsg: null,
                data: data
            });
            promise.resolve();
        }).catch(function (e) {
            promise.reject(new Error(e));
        })
    } else if (req.body.mode == 3) {
        Event.findAll({
            attributes: {
                include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%Y/%m/%d %H:%i'), 'deadlineTime_formated'],
                    [sequelize.fn('date_format', sequelize.col('startTime'), '%Y/%m/%d %H:%i'), 'startTime_formated']]
            },
            include: [
                {model: User, as: 'holder', attributes: ['userName', 'id']},
                {model: User, as: 'participantList', attributes: ['userName', 'id'], where: {id: req.body.userId}}],
            where: {
                startTime: {$gt: Date.now()}
            }
        }).then(function (events) {
            data = JSON.parse(JSON.stringify(events));
            return Event.findAll({
                attributes: {
                    include: [[sequelize.fn('date_format', sequelize.col('deadlineTime'), '%Y/%m/%d %H:%i'), 'deadlineTime_formated'],
                        [sequelize.fn('date_format', sequelize.col('startTime'), '%Y/%m/%d %H:%i'), 'startTime_formated']]
                },
                include: [
                    {model: User, as: 'holder', attributes: ['userName', 'id'], where: {id: req.body.userId}},
                    {model: User, as: 'participantList', attributes: ['userName', 'id']}],
                where: {
                    startTime: {$gt: Date.now()}
                }
            });
        }).then(function (events2) {
            Array.prototype.push.apply(data, JSON.parse(JSON.stringify(events2)));
            res.send({
                errorMsg: null,
                data: data
            });
            promise.resolve();
        }).catch(function (e) {
            promise.reject(new Error(e));
        })
    }
    return promise;
};

exports.joinEvent = function (req, res, promise) {

    console.log(req.body);
    var cur;

    if (req.body.userId == null || req.body.userId == undefined) {
        promise.reject();
        return promise;
    }

    if (req.body.eventId == null || req.body.eventId == undefined) {
        promise.reject();
        return promise;
    }

    Event.findById(req.body.eventId).then(function (event) {
        cur = event.currentPpl;
        if (event.holderId == req.body.userId)
            throw 'holderCannotJoinSelfEvent';
        if (event.currentPpl == event.maxPpl - 1)
            throw 'eventFull';
    }).then(function () {
        return Participation.findOrCreate({
            where: {
                userId: req.body.userId,
                eventId: req.body.eventId
            },
            defaults: {attendence: false}
        })
    }).spread(function (participation, created) {
        if (!created)
            throw 'alreadyJoined';
        return Event.update({
            currentPpl: cur + 1
        }, {where: {id: req.body.eventId}})

    }).then(function () {
        res.send({
            errorMsg: null
        });
        promise.resolve();
    }).catch(function (e) {
        if (e == 'holderCannotJoinSelfEvent' || e == 'eventFull' || 'alreadyJoined') {
            res.send({
                errorMsg: e
            });
            promise.resolve();
        } else {
            promise.reject();
        }

    });
    return promise;
};

exports.quitEvent = function (req, res, promise) {
    console.log(req.body);
    var cur;

    if (req.body.userId == null || req.body.userId == undefined) {
        promise.reject();
        return promise;
    }

    if (req.body.eventId == null || req.body.eventId == undefined) {
        promise.reject();
        return promise;
    }

    Event.findById(req.body.eventId).then(function (event) {
        cur = event.currentPpl;
    }).then(function () {
        return Participation.destroy({
            where: {
                eventId: req.body.eventId,
                userId: req.body.userId
            }
        });
    }).then(function () {
        return Event.update({
            currentPpl: cur - 1
        }, {where: {id: req.body.eventId}});
    }).then(function () {
        res.send({
            errorMsg: null
        });
        promise.resolve();
    }).catch(function (e) {
        res.send({
            errorMsg: e
        });
    });
    return promise;
};

exports.deleteEvent = function (req, res, promise) {
    console.log(req.body);

    Event.destroy({
        where: {
            id: req.body.eventId
        }
    }).then(function (affectedRows) {
        if (affectedRows !== 1)
            throw 'cannotDeleteEvent';
        promise.resolve();
        res.send({
            errorMsg: null
        });
    }).catch(function (e) {
        if (e == 'cannotDeleteEvent') {
            res.send({
                errorMsg: e
            });
            promise.resolve();
        } else {
            promise.reject();
        }
    });
    return promise;
};
