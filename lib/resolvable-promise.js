module.exports = function(funct) {
    var res, rej;
    var promise = new Promise(function(resolve, reject) {
        res = resolve;
        rej = reject;
        if (typeof funct == 'function')
            funct(resolve, reject);
    });
    promise.resolve = res;
    promise.reject = rej;
    return promise;
};