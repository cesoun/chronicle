import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

// Routers
import indexRouter from './src/routes/index';
import registerRouter from './src/routes/register';
import loginRouter from './src/routes/login';

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Routing
app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);

module.exports = app;
