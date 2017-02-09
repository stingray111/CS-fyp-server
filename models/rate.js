var seq = require('./seq');
var Sequelize = require('sequelize');

var Rate = seq.define('Rate', {
    id : {
        unique: true,
        primaryKey: true,
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    extraversion: Sequelize.FLOAT,
    agreeableness: Sequelize.FLOAT,
    conscientiousness: Sequelize.FLOAT,
    neuroticism: Sequelize.FLOAT,
    openness: Sequelize.FLOAT,
    userId: Sequelize.INTEGER,
    otherUserId: Sequelize.INTEGER,
    weight: Sequelize.INTEGER
});

module.exports = Rate;