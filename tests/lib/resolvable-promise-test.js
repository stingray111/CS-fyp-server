var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var rPromise = require('../../lib/resolvable-promise');

context('resolvable-promise', function() {
   it('resolves itself', function(done) {
       var promise = rPromise();
       promise.then(function() {
           done();
       });
       promise.resolve();
   });

    it('rejects itself', function(done) {
        var promise = rPromise();
        promise.catch(function() {
            done();
        });
        promise.reject();
    });

    it('can resolve itself in the provided function', function() {
        return rPromise(function (resolve, reject) {
            resolve();
        });
    });
});
