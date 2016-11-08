var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/indexes');
var users = require('./routes/users');
var admin = require('./routes/admins');

var app = express();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var logTracer = require('tracer').console(
		{
			format : "{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})",	
			dateformat: 'yyyy-mm-dd HH:MM:ss',
			level:'trace'
		}
	); 

global.logger = logTracer;

// status determined by offset (ms)
global.status = {
		
		'good':{'low' : 0,    'high' : 500, 'Level':'GOOD'},
		'warn':{'low' : 500, 'high' : 2000, 'Level':'WARN'},
		'fail':{'low' : 2000, 'high' : Number.POSITIVE_INFINITY, 'Level':'FAIL'}
};

app.use(function(req,res,next){
	req.io = app.get('io');
	next();
});

app.use('/users', users);
app.use('/admin', admin);
app.use('*', routes);
app.use('/', routes);


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
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
