const jwt = require('jsonwebtoken');
require('dotenv').config();
const Util = {};

Util.checkJWTToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);
        console.log('verified token');
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = Util;
