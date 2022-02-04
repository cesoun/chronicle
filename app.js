const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routers
const indexRouter = require('./src/routes/index');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routing
app.use('/', indexRouter);

module.exports = app;
