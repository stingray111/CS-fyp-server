exports.truncate = function (seq) {
    var SequelizeModels = arguments;
    return seq.transaction(function (t) {
        var options = {
            raw: true,
            transaction: t
        };
        return seq
            .query('SET foreign_key_checks=0', options)
            .then(function () {
                var ps = [];
                for (var i = 1; i < SequelizeModels.length; i++) {
                    var Model = SequelizeModels[i];
                    ps.push(seq.query('TRUNCATE TABLE `' + Model.getTableName() + '`', options))
                }
                return ps;
            }).then(function() {
                return seq.query('SET foreign_key_checks=1', options);
            })
    })
};

exports.drop = function(seq) {
    var SequelizeModels = arguments;
    return seq.transaction(function (t) {
        var options = {
            raw: true,
            transaction: t
        };
        return seq
            .query('SET foreign_key_checks=0', options) //TODO sqlite?
            .then(function () {
                var ps = [];
                for (var i = 1; i < SequelizeModels.length; i++) {
                    var Model = SequelizeModels[i];
                    ps.push(seq.query('DROP TABLE `' + Model.getTableName() + '`', options))
                }
                return ps;
            }).then(function() {
                return seq.query('SET foreign_key_checks=1', options);
            })
    })
};

exports.save = function(seqInstance) {
    var SequelizeInstances = arguments;
    var p = Promise.resolve();
    for (var i = 0; i < SequelizeInstances.length; i++) {
        ((i) => {
            p = p.then(() => (SequelizeInstances[i].save()));
        })(i);
    }
    return p;
};