var seq = require('./seq');
var Sequelize = require('sequelize');

var Rate = seq.define('rate', {
    id : {
        unique: true,
        primaryKey: true,
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    extraversion: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {isFloat: true, max: 4, min: -4}
    },
    agreeableness: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {isFloat: true, max: 4, min: -4}
    },
    conscientiousness: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {isFloat: true, max: 4, min: -4}
    },
    neuroticism: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {isFloat: true, max: 4, min: -4}
    },
    openness: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {isFloat: true, max: 4, min: -4}
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    },
    otherUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    },
    weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true, min: 0}
    },
    eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    }
}, {paranoid: true});

module.exports = Rate;