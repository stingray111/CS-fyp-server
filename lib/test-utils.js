var utils = require('./utils');
var chai = require('chai');
chai.use(require('chai-as-promised'));

exports.controllers = {
    expectRejected: function (promise, sequelizeModelArray, rejectedWith) {
        if (!sequelizeModelArray)
            sequelizeModelArray = [];
        else if (!(sequelizeModelArray instanceof Array)) {
            sequelizeModelArray = [sequelizeModelArray];
        }
        var ps = [
            new Promise(function (resolve, reject) {
                promise.then(function () {
                    reject('expected promise to be rejected, but it was fulfilled')
                }).catch(function (e) {
                    if (utils.isset(rejectedWith) && e !== rejectedWith) {
                        reject('expected promise to be rejected with \'' + rejectedWith + '\', but it was rejectedWith \'' + e + '\'')
                    }
                    resolve();
                });
            })
        ];
        //check database records
        sequelizeModelArray.forEach(function (Model) {
            ps.push(Model.findAll().then(function (records) {
                if (records.length != 0)
                    throw(records.length + ' record(s) found in ' + Model.getTableName());
            }));
        });
        return Promise.all(ps);
    }
};

exports.genTests = function(subTests, func) {
    for (var k in subTests) {
        (function (k) {
            it(k, function() {
                var data = subTests[k];
                if (typeof data === 'function')
                    data = data();
                var ret = func(data, k);
                if (typeof ret.then === 'function')
                    return ret;
            })
        })(k);
    }
};