var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var seqUtils = require('../../lib/seq-utils');
var seq = require('../../models/seq');

/*
 if not Sequelize Model?
 */

context('seq-utils', function () {
    context('truncate()', function () {
        var TestTable1, TestTable2;
        before(function () {
            TestTable1 = seq.define('TestTable1', {});
            TestTable2 = seq.define('TestTable2', {});
            TestTable1.hasMany(TestTable2);
            return dropTables().then(function () {
                return TestTable1.sync({force: true})
            }).then(function () {
                return TestTable2.sync({force: true});
            }).then(function () {
                return TestTable1.create({});
            }).then(function (t1) {
                return TestTable2.create({
                    TestTable1Id: t1.id
                })
            })
        });

        after(function () {
            return dropTables();
        });

        function dropTables() {
            return TestTable2.drop().then(function () {
                TestTable1.drop();
            });
        }

        it('truncates TestTable1 cascade constrains', function () {
            var p = seqUtils.truncate(seq, TestTable1);
            return p.then(function () {
                return TestTable1.findAll();
            }).then(function (t1s) {
                expect(t1s.length).to.equal(0);
                return TestTable2.findAll();
            }).then(function (t2s) {
                expect(t2s.length).to.equal(1);
            });
        });

        it('multiple tables support', function () {
            return seqUtils.truncate(seq, TestTable1, TestTable2).then(function () {
                return Promise.all([
                    TestTable1.findAll().then(function (t1s) {
                        expect(t1s.length).to.equal(0);
                    }),
                    TestTable2.findAll().then(function (t2s) {
                        expect(t2s.length).to.equal(0);
                    })
                ])
            })
        });
    });

    context('drop()', function () {
        var TestTable1, TestTable2;
        beforeEach(function () {
            TestTable1 = seq.define('TestTable1', {});
            TestTable2 = seq.define('TestTable2', {});
            TestTable1.hasMany(TestTable2);
            return dropTables().then(function () {
                return TestTable1.sync({force: true})
            }).then(function () {
                return TestTable2.sync({force: true});
            });
        });

        afterEach(function () {
            return dropTables();
        });

        function dropTables() {
            return TestTable2.drop().then(function () {
                TestTable1.drop();
            });
        }

        it('drops TestTable1 cascade constrains', function () {
            return seqUtils.drop(seq, TestTable1).then(function () {
                return expect(TestTable1.create({})).to.be.rejected;
            })
        });

        it('multiple table support', function () {
            return seqUtils.drop(seq, TestTable1, TestTable2).then(function () {
                return Promise.all([
                    expect(TestTable1.create({})).to.be.rejected,
                    expect(TestTable2.create({})).to.be.rejected
                ]);
            })
        });

    })

    context('save()', function () {
        var TestTable = seq.define('TestTable', {});
        before(() => (TestTable.sync({force: true})));
        after(() => (TestTable.drop()));
        it('saves instances to db', function () {
            var testTable = TestTable.build({});
            seqUtils.save(testTable).then(() => (TestTable.findAll()))
                .then((records) => {
                    expect(records.length).to.equal(1);
                })
        });
        it('multi-instances support', function () {
            var r1 = TestTable.build({});
            var r2 = TestTable.build({});
            seqUtils.save(r1, r2).then(() => (TestTable.findAll()))
                .then((records) => {
                    expect(records.length).to.equal(2);
                })
        })
    })
});