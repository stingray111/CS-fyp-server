var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var hasher = require('../../lib/hasher');
var crypto = require("crypto");

context('hasher.hash()', function () {
    it('hashes a value', function () {
        var pwHash = crypto.createHash('sha256').update('password').digest('base64');
        expect(hasher.hash('password')).to.equal(pwHash);
    });

    it('salts the hashes a value', function () {
        var salt = 'salt';
        var pwHash = crypto.createHash('sha256').update('password' + salt).digest('base64');
        expect(hasher.hash('password', salt)).to.equal(pwHash);
    });
});