var seq = require('./../seq');
var sequence = ['participant-list.js', 'user', 'login-status','event','rate'];

exports.createDB = function () {
    var p = seq.query('SET foreign_key_checks=0');
    (function loop(i) {
        if (i == sequence.length) {
            p.then(function () {
                return seq.query('SET foreign_key_checks=1');
            });
            return;
        }
        var m = require('../' + sequence[i]);
        p = p.then(function () {
            return m.sync({force: true})
        });
        loop(i + 1);
    })(0);
    return p;
};

exports.dropDB = function () {
    var p = seq.query('SET foreign_key_checks=0');
    (function loop(i) {
        if (i < 0) {
            p.then(function () {
                return seq.query('SET FOREIGN_KEY_CHECKS=1');
            });
            return;
        }
        var m = require('../' + sequence[i]);
        p = p.then(function () {
            return m.drop();
        });
        loop(i - 1);
    })(sequence.length - 1);
    return p;
};

exports.rebuildDB = function () {
    return exports.dropDB().then(exports.createDB);
};

// truncateDB() is not stable, use rebuildDB() instead
exports.truncateDB = function () {
    return seq.transaction(function (t) {
        var options = {raw: true, transaction: t};
        var p = seq.query('SET foreign_key_checks=0', options);
        (function loop(i) {
            if (i == sequence.length) {
                p.then(function () {
                    return seq.query('SET foreign_key_checks=1', options);
                });
                return;
            }
            var m = require('../' + sequence[i]);
            p = p.then(function () {
                return m.truncate(options);
            });
            loop(i + 1);
        })(0);
        return p;
    })
};


exports.testDBConn = function () {
    var seq = require('../seq');
    return seq.authenticate();
};