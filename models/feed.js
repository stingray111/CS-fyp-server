var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our feed model
var Feed = seq.define('Feed', {
    id : {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userId : Sequelize.INTEGER,
    actionId : Sequelize.INTEGER,
    customAction : Sequelize.STRING,
    audio : Sequelize.STRING,
    expiryTime: Sequelize.DATE
});

module.exports = Feed;

var User = require('./user');
Feed.belongsTo(User, {foreignKey: 'userId'});
var Action = require('./action');
Feed.belongsTo(Action, {foreignKey: 'actionId'});
var FeedAccess = require('./feed-access');
Feed.hasMany(FeedAccess, {foreignKey: 'feedId'});
Feed.belongsToMany(User, {
    through: FeedAccess,
    as: 'accessibleUsers',
    foreignKey: 'feedId',
    otherKey: 'userId'
});
