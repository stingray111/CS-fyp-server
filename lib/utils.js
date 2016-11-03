exports.strNotEmpty = function(str) {
    //Check whether str is a string and not an empty string
    return str !== undefined &&
        str !== null &&
        (typeof str === 'string' && str !== '' ||
        str instanceof String && str != '');
};

exports.typeIn = function() {
    var val = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        if (typeof val === arguments[i])
            return true;
    }
    return false;
};

exports.isset = function(val) {
    return val !== undefined && val !== null;
};

exports.runAll = function (dataArray, testFunc) {
    var ps = [];
    dataArray.forEach(function (data, i) {
        var result = testFunc(data, i);
        if (result instanceof Promise)
            ps.push(result);
    });
    return Promise.all(ps);
};

exports.runInOrder = function (dataArray, testFunc) {
    var p = Promise.resolve();

    dataArray.forEach(function(val, i) {
        (function(val, i) {
            p = p.then(function() {
                var result = testFunc(val, i);
                if (result instanceof Promise)
                    return result;
            });
        })(val, i);
    });

    return p;
};