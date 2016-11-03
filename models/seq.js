var env = require('../env');
var Sequelize = require('sequelize');
module.exports = new Sequelize(env.DB_NAME, env.DB_USERNAME, env.DB_PASSWORD, {
    host: env.DB_HOST,
    dialect: env.DB_TYPE,
    define : {
        freezeTableName : true,
        paranoid: true
    }
});