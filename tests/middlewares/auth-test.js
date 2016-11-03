var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var auth = require('../../middleware/auth');
var rPromise = require('../../lib/resolvable-promise');

context('auth', function() {
    it('should always be resolved', function() {
        return expect(auth({}, {}, rPromise())).to.be.fulfilled;
    })
});