var Event = require('../models/event');
var crypto = require('crypto');
var hasher = require('../lib/hasher');

exports.pushEvent = function (req, res, promise) {
    Event.create({
        holderId: req.body.holderId,
        name: req.body.name,
        place: req.body.place,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        description: req.body.description,
        deadlineTime: sequelize.fn('STR_TO_DATE', req.body.deadlineTime, '%d/%m %H:%i'),
        startTime: req.body.startTime,
        minPpl: req.body.minPpl,
        maxPpl: req.body.maxPpl
    })
};

exports.getEvents = function (req, res, promise) {
    const latPerKilo = 0.009009;
    const lngPerKilo = 0.011764;

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
            where: {
                // todo fix range issue in pole??
                latitude: {$between: [req.body.latitude - 50 * latPerKilo, req.body.latitude + 50 * latPerKilo]},
                longitude: {$between: [req.body.longitude - 50 * lngPerKilo, req.body.longitude + 50 * lngPerKilo]}
            },
            attributes: [
                'id',
                'holderId',
                'name',
                'place',
                'latitude',
                'longitude',
                'description',
                'minPpl',
                'maxPpl',
                [sequelize.fn('date_format', sequelize.col('deadlineTime'), '%d/%m %H:%i'), 'deadlineTime_formated'],
                [sequelize.fn('date_format', sequelize.col('deadlineTime'), '%d/%m %H:%i'), 'deadlineTime_formated']
            ]
        }).then(function (events) {

            var temp = events.map(function (item) {
                return {
                    id: item.id,
                    holderId: item.holderId,
                    name: item.name,
                    place: item.place,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    description: item.description,
                    minPpl: item.minPpl,
                    maxPpl: item.maxPpl,
                    currentPpl: item.getParticipants()
                }

            });
            console.log()
            res.send({
                errorMsg: null,
                data: events
            });
            promise.resolve();
        })
    }
    return promise;
};