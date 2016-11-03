var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our user model
var User = seq.define('User', {
    id : {
        primaryKey: true,
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    email :Sequelize.STRING,
    icon: Sequelize.STRING,
    description: Sequelize.STRING,
    privacy: Sequelize.STRING
});

module.exports = User;

var Follow = require('./follow');
User.hasMany(Follow, {foreignKey: 'followeeUserId', as: 'followerFollows'});
User.hasMany(Follow, {foreignKey: 'followerUserId', as: 'followeeFollows'});
User.belongsToMany(User, {
    through: Follow,
    as: 'followers',
    foreignKey: 'followeeUserId',
    otherKey: 'followerUserId'
});
User.belongsToMany(User, {
    through: Follow,
    as: 'followees',
    foreignKey: 'followerUserId',
    otherKey: 'followeeUserId'
});
var Feed = require('./feed');
User.hasMany(Feed, {foreignKey: 'userId'});
var FeedAccess = require('./feed-access');
User.hasMany(FeedAccess, {foreignKey: 'userId'});
User.belongsToMany(Feed, {
    through: FeedAccess,
    as: 'accessibleFeeds',
    foreignKey: 'userId',
    otherKey: 'feedId'
});
var LoginStatus = require('./login-status');
User.hasMany(LoginStatus, {foreignKey: 'userId'});