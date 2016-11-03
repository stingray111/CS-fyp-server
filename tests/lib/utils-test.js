var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var utils = require('../../lib/utils');
var sinon = require('sinon');

context('utils', function() {
    context('strNotEmpty()', function() {
        it('should return true', function() {
            expect(utils.strNotEmpty('this is a string')).to.equal(true);
            expect(utils.strNotEmpty(new String('foobar'))).to.equal(true);
        });
        it('should return false', function() {
            expect(utils.strNotEmpty(undefined)).to.equal(false);
            expect(utils.strNotEmpty(null)).to.equal(false);
            expect(utils.strNotEmpty('')).to.equal(false);
            expect(utils.strNotEmpty(123)).to.equal(false);
            expect(utils.strNotEmpty({})).to.equal(false);
            expect(utils.strNotEmpty(new String())).to.equal(false);
            expect(utils.strNotEmpty(new String(''))).to.equal(false);
        });
    });

    context('typeIn()', function() {
        it('should return true', function() {
            expect(utils.typeIn('This is a string', 'number', 'array', 'string'));
        });
    });

    context('isset()', function() {     //return if a value is not null and not undefined
        it('should return true', function() {
            expect(utils.isset(123)).to.equal(true);
            expect(utils.isset(0)).to.equal(true);
            expect(utils.isset('')).to.equal(true);
        });
        it('should return false', function() {
            expect(utils.isset(null)).to.equal(false);
            expect(utils.isset(undefined)).to.equal(false);
        })
    });

    context('runAll()', function () {
        it('parameter function returns promise', function () {
            var func = sinon.stub().returns(Promise.resolve());
            var p = utils.runAll(['one', 2, undefined], func);
            expect(p).to.be.a('promise');
            return Promise.all([
                expect(p).to.be.fulfilled,
                p.then(function () {
                    expect(func.callCount).to.equal(3);
                    expect(func.calledWith('one', 0)).to.equal(true);
                    expect(func.calledWith(2, 1)).to.equal(true);
                    expect(func.calledWith(undefined, 2)).to.equal(true);
                })
            ])
        });
        it('parameter function does not return promise', function () {
            var func = sinon.spy();
            var p = utils.runAll(['one', 2, undefined], func);
            expect(p).to.be.a('promise');
            return Promise.all([
                expect(p).to.be.fulfilled,
                p.then(function () {
                    expect(func.callCount).to.equal(3);
                    expect(func.calledWith('one', 0)).to.equal(true);
                    expect(func.calledWith(2, 1)).to.equal(true);
                    expect(func.calledWith(undefined, 2)).to.equal(true);
                })
            ])
        });
    });

    context('runInOrder()', function () {
        it('parameter function returns promise', function () {
            var func = sinon.stub().returns(Promise.resolve());
            var p = utils.runInOrder(['one', 2, undefined], func);
            expect(p).to.be.a('promise');
            return Promise.all([
                expect(p).to.be.fulfilled,
                p.then(function () {
                    expect(func.callCount).to.equal(3);
                    expect(func.getCall(0).calledWith('one', 0)).to.equal(true);
                    expect(func.getCall(1).calledWith(2, 1)).to.equal(true);
                    expect(func.getCall(2).calledWith(undefined, 2)).to.equal(true);
                })
            ]);
        });
    })
});