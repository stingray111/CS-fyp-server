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
    userName: Sequelize.STRING,
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    nickName: Sequelize.STRING,
    gender: Sequelize.BOOLEAN,
    proPic: Sequelize.BOOLEAN,
    password: Sequelize.STRING,
    salt: Sequelize.STRING,
    saltDate: Sequelize.DATE,
    description: Sequelize.STRING,
    attendEventNum: Sequelize.INTEGER,
    abcentEventNum: Sequelize.INTEGER,
    holdEventNum: Sequelize,
    email :Sequelize.STRING,
    phone: Sequelize.STRING
});

module.exports = User;

// var Follow = require('./follow');
// User.hasMany(Follow, {foreignKey: 'followeeUserId', as: 'followerFollows'});
// User.hasMany(Follow, {foreignKey: 'followerUserId', as: 'followeeFollows'});
// User.belongsToMany(User, {
//     through: Follow,
//     as: 'followers',
//     foreignKey: 'followeeUserId',
//     otherKey: 'followerUserId'
// });
// User.belongsToMany(User, {
//     through: Follow,
//     as: 'followees',
//     foreignKey: 'followerUserId',
//     otherKey: 'followeeUserId'
// });

var Event = require('./event');
User.hasMany(Event, {foreignKey: 'holderId'});

var ParticipantList = require('/participant-list');
User.belongsToMany(ParticipantList, {
    as: ''
});