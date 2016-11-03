var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var dbTasks = require('../../../models/tasks');
var User = require('../../../models/user');
var LoginStatus = require('../../../models/login-status');
var Follow = require('../../../models/follow');
var Verb = require('../../../models/verb');
var Action = require('../../../models/action');
var Feed = require('../../../models/event');
var FeedAccess = require('../../../models/feed-access');

context('tasks.createDB()', function () {
    /* TODO
        Add more accesser checks
     */
    before(function () {
        return dbTasks.dropDB();
    });

    after(function () {
         return dbTasks.rebuildDB();
    });

    it('creates the database', function () {
        var now = Date.now();
        return dbTasks.createDB().then(function () {
            return User.create({
                username: 'username',
                password: 'password',
                email: 'email',
                icon: 'icon',
                description: 'description'
            }).then(function (user) {
                expect(user).to.include({
                    username: 'username',
                    password: 'password',
                    email: 'email',
                    icon: 'icon',
                    description: 'description'
                });
                expect(user).to.respondTo('getFeeds');
                expect(user).to.respondTo('getLoginStatuses');
                expect(user).to.respondTo('getFollowerFollows');
                expect(user).to.respondTo('getFolloweeFollows');
                expect(user).to.respondTo('getFollowers');
                expect(user).to.respondTo('getFollowees');
                expect(user).to.respondTo('setFollowers');
                expect(user).to.respondTo('setFollowees');
                expect(user).to.respondTo('addFollower');
                expect(user).to.respondTo('addFollowee');
                expect(user).to.respondTo('addFollowers');
                expect(user).to.respondTo('addFollowees');
                expect(user).to.respondTo('getAccessibleFeeds');
                expect(user).to.respondTo('setAccessibleFeeds');
                expect(user).to.respondTo('addAccessibleFeed');
                expect(user).to.respondTo('addAccessibleFeeds');
                return LoginStatus.create({
                    id: 'id',
                    userId: 1,
                    ipaddr: 'ipaddr',
                    platform: 'platform'
                });
            }).then(function (loginStatus) {
                expect(loginStatus).to.include({
                    id: 'id',
                    userId: 1,
                    ipaddr: 'ipaddr',
                    platform: 'platform'
                });
                expect(loginStatus).to.respondTo('getUser');
                return Follow.create({
                    followerUserId: 1,
                    followeeUserId: 1,
                    acceptedTime: now,
                    subscribe: 1
                });
            }).then(function (follow) {
                expect(follow).to.include({
                    followerUserId: 1,
                    followeeUserId: 1,
                    subscribe: 1
                });
                expect(follow).to.respondTo('getFollower');
                expect(follow).to.respondTo('getFollowee');
                return Verb.create({
                    name: 'name'
                })
            }).then(function (verb) {
                expect(verb).to.include({
                    name: 'name'
                });
                expect(verb).to.respondTo('getActions');
                return Action.create({
                    name: 'name',
                    icon: 'icon',
                    verbId: 1
                })
            }).then(function (action) {
                expect(action).to.include({
                    name: 'name',
                    icon: 'icon',
                    verbId: 1
                });
                expect(action).to.respondTo('getVerb');
                return Feed.create({
                    userId: 1,
                    actionId: 1,
                    customAction: 'customAction',
                    audio: 'audio',
                    expiryTime: now
                });
            }).then(function (feed) {
                expect(feed).to.include({
                    userId: 1,
                    actionId: 1,
                    customAction: 'customAction',
                    audio: 'audio'
                });
                expect(feed.expiryTime.getTime()).to.equal(now);
                expect(feed).to.respondTo('getUser');
                expect(feed).to.respondTo('getAction');
                expect(feed).to.respondTo('getFeedAccesses');
                expect(feed).to.respondTo('getAccessibleUsers');
                expect(feed).to.respondTo('setAccessibleUsers');
                expect(feed).to.respondTo('addAccessibleUser');
                expect(feed).to.respondTo('addAccessibleUsers');
                return FeedAccess.create({
                    feedId: 1,
                    userId: 1,
                    accessedTime: now
                })
            }).then(function (feedAccess) {
                expect(feedAccess).to.include({
                    feedId: 1,
                    userId: 1
                });
                expect(feedAccess.accessedTime.getTime()).to.equal(now);
                expect(feedAccess).to.respondTo('getFeed');
            });
        })
    });
})
;