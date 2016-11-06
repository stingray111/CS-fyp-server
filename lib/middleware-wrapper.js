var rPromise = require('./resolvable-promise');
module.exports = function () {
    var functs = arguments;
    for (var i = 0; i < functs.length; i++) {
        if (typeof functs[i] !== 'function') {
            throw 'Middleware/Controllers must be a function!';
        } else if (functs[i].length !== 3) {
            throw 'Middleware/Controllers must be a function accepting 3 arguments (req, res, promise)'
        }
    }
    return function (req, res, next) {
        (function loop(i) {
            if (i == functs.length) {
                next();
                return;
            }
            var promise = functs[i](req, res, rPromise());
            if (!promise || typeof promise.then !== 'function') {   //middleware does not return a promise
                next('Middleware/Controllers must return a promise!');
                return;
            }
            promise.then(function (result) {
                if (result)
                    loop(i + 1);
            }).catch(function (err) {
                console.log(err);
                if (err === undefined || err === null)
                    err = 'Error!!!';
                next(err);
            });
        })(0);
    };
};