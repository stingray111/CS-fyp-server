var seq = require('./../seq');
var sequence = ['user', 'login-status','event','participant-list.js', 'rate'];
var env = require('./../../env');
var Event = require('./../../models/event');

(function loop(i) {
    if (i == 500) {
        return;
    }
    var m = Event.create({
        holderId: 1,
        name: 'Test-event-' + i,
        place: 'Test Place',
        latitude: 22.353727 + 0.001 * i * -1**(i%2+1) * -1**(i%2+2),
        longitude: 114.120483 + 0.001 * i * -1**(i%2+1),
        description: 'Description',
        deadlineTime: '2017-12-12 08:08' + ' -0', //moment(req.body.eventDeadline, "YYYY-MM-DD HH:mm").toDate(),
        startTime: '2017-12-12 08:08' + ' -0', //moment(req.body.eventStart, "YYYY-MM-DD HH:mm").toDate(),
        currentPpl: 0,
        minPpl: 8,
        maxPpl: 12
    });
    return m.then(function () {
        return loop(i + 1);
    });
})(0);