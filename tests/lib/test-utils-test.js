var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var testUtils = require('../../lib/test-utils');
var sinon = require('sinon');

context('test-utils', function () {
    context('controllers', function () {
        context('expectRejected', function () {
            var TestTable, TestTable2;
            before(function () {
                var Sequelize = require('sequelize');
                var seq = new Sequelize('sqlite::memory');
                TestTable = seq.define('TestTable', {}, {freezeTableName: true});
                TestTable2 = seq.define('TestTable2', {}, {freezeTableName: true});
                return Promise.all([TestTable.sync(), TestTable2.sync()]);
            });

            beforeEach(function () {
                return Promise.all([TestTable.truncate(), TestTable2.truncate()])
            });

            it('the promise should be rejected', function () {
                var promise = Promise.reject();
                var retVal = testUtils.controllers.expectRejected(promise);
                expect(retVal).to.be.a('promise');
                return expect(retVal).to.be.fulfilled;
            });

            it('should be rejected when the promise passed in is resolved', function () {
                var promise = Promise.resolve();
                return expect(testUtils.controllers.expectRejected(promise))
                    .to.be.rejectedWith('expected promise to be rejected, but it was fulfilled');
            });

            it('checks there are no database records', function () {
                var promise = Promise.reject();
                return expect(testUtils.controllers.expectRejected(promise, [TestTable])).to.be.fulfilled;
            });

            it('returns error if database has records', function () {
                var promise = Promise.reject();
                return TestTable.create({}).then(function () {
                    return expect(testUtils.controllers.expectRejected(promise, [TestTable]))
                        .to.be.rejectedWith('1 record(s) found in TestTable');
                })
            });

            it('multiple models passed in', function () {
                var promise = Promise.reject();
                return TestTable2.create({}).then(function () {
                    return expect(testUtils.controllers.expectRejected(promise, [TestTable, TestTable2]))
                        .to.be.rejectedWith('1 record(s) found in TestTable2');
                });
            });

            it('single Sequelize Model instance as parameter', function () {
                var promise = Promise.reject();
                return expect(testUtils.controllers.expectRejected(promise, TestTable))
                    .to.be.fulfilled;
            });

            it('rejected with correct reject message', function() {
                var promise = Promise.reject('NO WAY!!!');
                return expect(testUtils.controllers.expectRejected(promise, TestTable, 'NO WAY!!!'))
                    .to.be.fulfilled;
            });

            it('rejected with incorrect reject message', function() {
                var promise = Promise.reject('YES');
                return expect(testUtils.controllers.expectRejected(promise, TestTable, 'NO WAY!!!'))
                    .to.be.rejectedWith('expected promise to be rejected with \'NO WAY!!!\', but it was rejectedWith \'YES\'');
            })
        })
    });
});
