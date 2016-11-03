var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our feed model
var Event = seq.define('Feed', {
    id : {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    holderId : Sequelize.INTEGER,
    name : Sequelize.STRING,
    place : Sequelize.STRING,
    latitude : Sequelize.FLOAT,
    longitude : Sequelize.FLOAT,
    description: Sequelize.STRING,
    deadlineTime: Sequelize.DATE,
    startTime: Sequelize.DATE,
    minPpl: Sequelize.INTEGER,
    maxPpl: Sequelize.INTEGER
});

module.exports = Event;

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
