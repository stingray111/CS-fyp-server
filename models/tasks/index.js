var seq = require('./../seq');
var sequence = ['user', 'login-status','event','participant-list.js', 'rate'];
var env = require('./../../env');

exports.createDB = function () {

    function asyncFunc(){
        if (env.DB_TYPE == 'postgres'){
            var m = (function loop(i) {
                if (i == sequence.length) {
                    return;
                }
                var m = require('../' + sequence[i]);
                return m.sync({force: false}).then(function () {
                    return loop(i + 1);
                });
            })(0);
            return m;
        } else {
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
                    return m.sync({force: false})
                });
                loop(i + 1);
            })(0);
            return p;
        }
    }

    asyncFunc()
    .then(function(){ 
        var User = require('../user.js');
        User.create({
            userName:'admin',
            email: 'admin@admin.com',
            password: '',
            firstName: 'admin',
            lastName: 'admin',
            nickName: 'admin',
            gender: 1,
            proPic: '',
            phone: '',
            description: 'this is the admin of the server',
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
            msgToken: '',
            level: 1,
            acType: 0
        });
    });
}

exports.dropDB = function () {
    if (env.DB_TYPE == 'postgres') {
        var m = (function loop(i) {
            if (i < 0) {
                return;
            }
            var m = require('../' + sequence[i]);
            return m.drop().then(function () {
                return loop(i - 1);
            });
        })(sequence.length - 1);
        return m;
    } else {
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
    }
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
