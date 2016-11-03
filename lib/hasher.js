var crypto = require("crypto");
exports.hash = function(password, salt) {
    if (salt !== undefined && salt !== null) {
        password += salt;
    }
    return crypto.createHash('sha256').update(password).digest('base64');
};

exports.hashVal = {
    dbPw: 'Kwoksiu hair short short',
    loginToken: 'long hair short Kwoksiu'
};