var Event = require('../models/event');
var User = require('../models/user');
var Rate = require('../models/rate');
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
        deadlineTime: req.body.eventDeadline + ' -0', //moment(req.body.eventDeadline, "YYYY-MM-DD HH:mm").toDate(),
        startTime: req.body.eventStart + ' -0', //moment(req.body.eventStart, "YYYY-MM-DD HH:mm").toDate(),
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

    console.log(req.body);

    //todo validation

    var eventTS = {
        rates: null
    };

    Event.findOne({
        attributes: {
            include: [[sequelize.fn('to_char', sequelize.col('deadlineTime'), 'YYYY/MM/DD HH24:MI'), 'deadlineTime_formated'],
                [sequelize.fn('to_char', sequelize.col('startTime'), 'YYYY/MM/DD HH24:MI'), 'startTime_formated']]
        },
        include: [
            {model: User, as: 'holder', attributes: ['userName', 'id']},
            {model: User, as: 'participantList', attributes: ['userName', 'id']},
            {model: Participation, as: 'attendance'}
        ],
        where: {id: req.body.id}
    }).then(function (event) {
        eventTS = event.get({
            plain: true
        });
    }).then(function () {
        return Rate.findAll({where: {
            userId: req.body.userId,
            eventId: req.body.id
        }, raw: true })
    }).then(function (rate) {
        if (rate != null)
            eventTS.rates = rate;
        console.log(eventTS);
        res.send(eventTS);
        promise.resolve();
    }).catch(function (e) {
        promise.reject(new Error(e));
    });
    return promise;
};

exports.getEvents = function (req, res, promise) {
    const latPerKilo = 0.009009;
    const lngPerKilo = 0.011764;
    var data = [];

    if (req.body.mode > 3 || req.body.mode < 1) {
        promise.reject(new Error('modeNotExist'));
        return promise;
    }

    if (req.body.mode == 1) {
        Event.findAll({
            attributes: {
                include: [[sequelize.fn('to_char', sequelize.col('deadlineTime'), 'YYYY/MM/DD HH24:MI'), 'deadlineTime_formated'],
                    [sequelize.fn('to_char', sequelize.col('startTime'), 'YYYY/MM/DD HH24:MI'), 'startTime_formated']]
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
            console.log(temp);
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
                include: [[sequelize.fn('to_char', sequelize.col('deadlineTime'), 'YYYY/MM/DD HH24:MI'), 'deadlineTime_formated'],
                    [sequelize.fn('to_char', sequelize.col('startTime'), 'YYYY/MM/DD HH24:MI'), 'startTime_formated']]
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
                    include: [[sequelize.fn('to_char', sequelize.col('deadlineTime'), 'YYYY/MM/DD HH24:MI'), 'deadlineTime_formated'],
                        [sequelize.fn('to_char', sequelize.col('startTime'), 'YYYY/MM/DD HH24:MI'), 'startTime_formated']]
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
                include: [[sequelize.fn('to_char', sequelize.col('deadlineTime'), 'YYYY/MM/DD HH24:MI'), 'deadlineTime_formated'],
                    [sequelize.fn('to_char', sequelize.col('startTime'), 'YYYY/MM/DD HH24:MI'), 'startTime_formated']]
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
                    include: [[sequelize.fn('to_char', sequelize.col('deadlineTime'), 'YYYY/MM/DD HH24:MI'), 'deadlineTime_formated'],
                        [sequelize.fn('to_char', sequelize.col('startTime'), 'YYYY/MM/DD HH24:MI'), 'startTime_formated']]
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
        return User.update({
            attendEventNum: sequelize.literal('attendEventNum +1')
        }, {where: {id: req.body.userId}})
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
        return User.update({
            attendEventNum: sequelize.literal('attendEventNum -1')
        }, {where: {id: req.body.userId}})
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

    // todo validation

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

exports.changeAttendance = function(req, res, promise) {
    // todo validation

    console.log(req.body);

    Participation.update({attendance: req.body.attendance},{where: {
        userId : req.body.userId,
        eventId : req.body.eventId
    }}).then(function () {
        res.send({
            errorMsg: null
        });
        promise.resolve();
    }).catch(function (e) {
        res.send({
            errorMsg: e
        });
        promise.reject();
    });
    return promise;
};
