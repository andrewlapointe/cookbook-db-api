const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const route = require('./src/api/routes');
const env = require('dotenv').config();
const pool = require('./database');
const { Pool } = require('pg');
const app = express();

app.use(
    session({
        store: new (require('connect-pg-simple')(session))({
            createTableIfMissing: true,
            pool,
        }),
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        name: 'sessionId',
    })
);
app.use(bodyParser.json());

app.use(
    '/',
    (req, res, next) => {
        console.log('Request Received');
        console.log(req);
        next();
    },
    route
);

const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
    console.log(`API listening on http://${host}:${port}`);
});
