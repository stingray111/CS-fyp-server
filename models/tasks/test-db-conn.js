require('../tasks').testDBConn().then(function (result) {
    console.log('Database-Connection has been established successfully.');
}).catch(function (err) {
    console.log('Unable to connect to the database:', err.message);
});