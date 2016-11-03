var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var mw = require('../../lib/middleware-wrapper');

context('middleware-wrapper', function () {
    it('passes req, res, promise to middleware', function () {
        var request = {foo: 'bar'},
            response = {hello: 'world'};

        var expressFunc = mw(function (req, res, promise) {
            expect(req).to.deep.equal(request);
            expect(res).to.deep.equal(response);
            expect(promise).to.be.a('promise');
            return promise
        });

        var next = function () {
        };
        expressFunc(request, response, next);
    });

    it('runs all middleware', function (done) {
        var req = {},
            res = {},
            count = 0;

        var middleware = function (req, res, promise) {
            count++;
            promise.resolve(true);
            return promise;
        };

        var expressFunc = mw(middleware, middleware, middleware);
        expressFunc(req, res, function () {
            try {
                expect(count).to.equal(3);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it("should't the next middleware if the promise is not resolved with true", function() {
        (mw(function (req, res, promise) {
            promise.resolve();
            return promise;
        }, function (req, res, promise) {
            expect('this should not be invoked').to.equal('');
        }))({}, {}, function() {});
    });

    it("should't run any middleware after a rejected promise", function (done) {
        var expressFunc = mw(function (req, res, promise) {
            promise.reject();
            return promise;
        }, function (req, res, promise) {
            done('this should not run');
            promise.resolve();
            return promise;
        });

        expressFunc({}, {}, function (err) {
            setTimeout(done, 1);
        });
    });

    it('calls next() with error when rejected', function (done) {
        (mw(function (req, res, promise) {
            promise.reject('rejected');
            return promise;
        }))({}, {}, function (err) {
            try {
                expect(err).to.equal('rejected');
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    it("calls next() with 'Error!!!' when rejected with no arguments", function (done) {
        (mw(function (req, res, promise) {
            promise.reject();
            return promise;
        }))({}, {}, function (err) {
            try {
                expect(err).to.equal('Error!!!');
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    it("calls next() with 'Middleware/Controllers must return a promise!' when middleware does not return promise", function (done) {
        (mw(function (req, res, promise) {
            promise.resolve();
            //no 'return promise'
        }))({}, {}, function (err) {
            try {
                expect(err).to.equal('Middleware/Controllers must return a promise!');
                done()
            } catch(e) { done(e); }
        });
    });

    it('throws exception when objects passed are not functions', function () {
        try {
            mw(undefined);
            expect('no exceptions threw').to.equal('');
        } catch (e) {
            expect(e).to.equal('Middleware/Controllers must be a function!');
        }
        try {
            mw(null);
            expect('no exceptions threw').to.equal('');
        } catch (e) {
            expect(e).to.equal('Middleware/Controllers must be a function!');
        }
        try {
            mw('abc');
            expect('no exceptions threw').to.equal('');
        } catch (e) {
            expect(e).to.equal('Middleware/Controllers must be a function!');
        }
        try {
            mw(function(){});
            expect('no exceptions threw').to.equal('');
        } catch (e) {
            expect(e).to.equal('Middleware/Controllers must be a function accepting 3 arguments (req, res, promise)');
        }
    });
});