const express = require('express');
const Promise = require('bluebird');
const crypto = require('crypto');
const path = require('path');
const ejs = require('ejs');
const favicon = require('serve-favicon');
const logger = require('morgan');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const config = require('./config');
const routes = require('./routes/index');
const users = require('./routes/users');
const account = require('./routes/account');
const file = require('./routes/file');
const leave = require('./routes/leave');
const calendar = require('./routes/calendar');
const event = require('./routes/event');
const authRequired = require('./utils/auth-required');

const User = require('./models/user');
const Calendar = require('./models/calendar');

mongoose.Promise = Promise;
Promise.promisifyAll(crypto);

const app = express();

mongoose.connect(config.mongodb);

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'ISA',
  resave: false,
  saveUninitialized: false,
  maxAge: 24 * 1000 * 3600
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api/users', users);
app.use('/api/file', file);
app.use('/api/leave', leave);
app.use('/api', account);
app.use('/api/calendar', authRequired, calendar);
app.use('/api/event', event);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorhandler());
  // app.use(function(err, req, res, next) {
  //   res.status(err.status || 500).json({
  //     message: err.message
  //   });
  // });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json(err);
});

module.exports = app;
