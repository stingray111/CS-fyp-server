var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var httpMock = require('node-mocks-http');
var request = require('request-promise');
var rPromise = require('../../lib/resolvable-promise');

var seqUtils = require('../../lib/seq-utils');
var testUtils = require('../../lib/test-utils');
var hasher = require('../../lib/hasher');

var loginCtrl = require('../../controllers/login-controller');

var seq = require('../../models/seq');
var User = require('../../models/user');
var LoginStatus = require('../../models/login-status');


describe('login-controller.logout()', function () {
    var req, res, now, token;

    beforeEach(function () {
        now = Date.now();
        req = httpMock.createRequest({
            method: 'POST',
            uri: '/api/logout',
            locals: {
                loginStatus: {
                    id: null
                }
            }
        });
        res = httpMock.createResponse();

        return seqUtils.truncate(seq, LoginStatus, User).then(function () {
            return User.create({
                username: 'abc',
                password: hasher.hash('abc', hasher.hashVal.dbPw),
                email: 'abc@gmail.com'
            });
        }).then(function () {
            return LoginStatus.create({
                id: hasher.hash(now.toString() + '192.5.22.222', hasher.hashVal.loginToken),
                userId: 1,
                ipaddr: '111.1.1.1',
                platform: 'AND'
            })
        }).then(function () {
            console.log('===============test start==================');
        });
    });

    afterEach(function () {
        return seqUtils.truncate(seq, User, LoginStatus);
    });

    //unit test: normal
    it('normal parameter - logout and delete loginStatus in DB', function () {
        req.locals.loginStatus.id = hasher.hash(now.toString() + '192.5.22.222', hasher.hashVal.loginToken);
        return loginCtrl.logout(req, res, rPromise()).then(function () {
            expect(res.statusCode).to.equal(200);
            expect(res._getData()).to.eql({
                err: null
            });
            return LoginStatus.findAll();
        }).then(function (loginStatuses) {
            expect(loginStatuses.length).to.equal(0);
        });
    });
});