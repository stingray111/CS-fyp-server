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
            errorMsg: null,
            event: event
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
        where: {id: req.body.id},
        order: [[ { model: User, as: 'participantList' }, 'userName']]
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
    var retStartId = Date.now();
    console.log(req.body.sortMode);
    var sortMode = req.body.sortMode;
    console.log(new Date(Number(req.body.startAt)));

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
		        createdAt: {$lt: new Date(req.body.startAt)},
                deadlineTime: {$gt: retStartId}
            },
	}).then(function(events){
		if(sortMode == 3){
		events.sort(function(a,b){
		    var na = a.name.toUpperCase();
		    var nb = b.name.toUpperCase();
		    if(na < nb){
			return -1;
		    }
		    if(na > nb){
			return 1;
		    }
		    return 0;
		});
		}
		if(sortMode == 2){
		events.sort(function(a,b){
			if(a.currentPpl < b.currentPpl){
				return -1;
			}
			if(a.currentPpl > b.currentPpl){
				return 1;
			}
			return 0;
		});
		}
		if(sortMode == 1){
		events.sort(function(a,b){
			var adiff = Math.abs(req.body.latitude - a.latitude)+Math.abs(req.body.longitude - a.longitude);
			var bdiff = Math.abs(req.body.latitude - b.latitude)+Math.abs(req.body.longitude - b.longitude);
			if (adiff < bdiff){
				return -1;
			}
			if(adiff > bdiff){
				return 1;
			}
			return 0;
		});
		}
		return events.slice(req.body.offset,req.body.offset+20);
        }).then(function (events) {
            var temp = JSON.parse(JSON.stringify(events));
            console.log(temp);
            res.send({
                errorMsg: null,
                data: temp,
		startId: retStartId
            });
            promise.resolve();
        }).catch(function (e) {
            console.log(e);
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
                    startTime: {$lt: Date.now()}
                }
            });
        }).then(function (eventOfHolder) {
            Array.prototype.push.apply(data, JSON.parse(JSON.stringify(eventOfHolder)));
            console.log(data);
            res.send({
                errorMsg: null,
                data: data
            });
            promise.resolve();
        }).catch(function (e) {
            console.log(e);
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
            console.log(events);
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
        }).then(function (eventOfHolder) {
            Array.prototype.push.apply(data, JSON.parse(JSON.stringify(eventOfHolder)));
            console.log(data);
            res.send({
                errorMsg: null,
                data: data
            });
            promise.resolve();
        }).catch(function (e) {
            console.log(e);
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
            attendEventNum: sequelize.literal('"attendEventNum" +1')  // todo fix this not int
        }, {where: {id: req.body.userId}})
    }).then(function () {
        res.send({
            errorMsg: null
        });
	console.log("res\n\n");
	console.log(res);
        promise.resolve();
    }).catch(function (e) {
        console.log(e);
        if (e == 'holderCannotJoinSelfEvent' || e == 'eventFull' || 'alreadyJoined') {
            res.send({
                errorMsg: e
            });
	    console.log(e);
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
            attendEventNum: sequelize.literal('"attendEventNum" -1')  // todo fix this not int
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
        if(req.body.attendance) {
            return Rate.restore({where: {
                otherUserId: req.body.userId,
                eventId: req.body.eventId
            }});
        } else {
            return Rate.destroy({where: {
                otherUserId: req.body.userId,
                eventId: req.body.eventId
            }});
        }
    }).then(function () {
        res.send({
            errorMsg: null
        });
        return Rate.count({where:{otherUserId: req.body.userId}});
    }).then(function (counts) {
        if (counts > 5)
            return seq.query("SELECT SUM(b.extraversion) as e, SUM(b.agreeableness) as a, SUM(b.conscientiousness) as c, SUM(b.neuroticism) as n, SUM(b.openness) as o, SUM(b.weight) as w FROM Rate As b INNER JOIN (SELECT MAX(id) as tt FROM Rate WHERE deletedAt IS NULL GROUP BY otherUserId LIMIT 30) AS a ON b.id = a.tt");
        else
            return [null,null];
    }).spread(function (results, metadata) {
        if (results != null)
            return User.update({
                adjustmentExtraversionWeightedSum: results[0].e,
                adjustmentAgreeablenessWeightedSum: results[0].a,
                adjustmentConscientiousnessWeightedSum: results[0].c,
                adjustmentNeuroticismWeightedSum: results[0].n,
                adjustmentOpennessWeightedSum: results[0].o,
                adjustmentWeight: results[0].w,
                isSelfRated: true
            }, {where: {id: req.body.userId }});
        else {
            return null;
        }
    }).then(function () {
        promise.resolve();
    }).catch(function (e) {
        console.log(e);
        // res.send({
        //     errorMsg: e
        // });
        promise.reject();
    });
    return promise;
};
