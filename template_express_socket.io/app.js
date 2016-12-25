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
var env = app.get('env');
 
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

// tracer log config
var logLevel ;

if(env === 'development'){
	logLevel = 'trace';	
	console.log('development environment!!');
}else{
	// dynamic하게 loglevel을 바꿀때, initial loglevel보다 아래로는 setting을 못하기 때문에, 가장 낮은 레벨로 set.
	// 기동 후 console에 log info command를 issue해서 level을 낮추는게 좋다.
	logLevel = 'trace';
	console.log('production environment!!');
}

var tracer = require('tracer');

var logTracer = tracer.console(
		{
			format : "{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})",	
			dateformat: 'yyyy-mm-dd HH:MM:ss',
			level:logLevel
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

// console utility

var printHelp  = function(){ 
	console.log("Valid cmd : %s", Object.keys(cmdMap).join(' ')) ;
};

var loglevel = function(argv){ 
	var level = argv.shift().trim();
	var validLevel = ["error","warn","info","debug","trace"];
	if(validLevel.indexOf(level) !== -1){
		tracer.setLevel(level);
		global.logger[level]('log level chagned to %s', level);
	}else{
		console.log('specify level one of %s', validLevel.join(' '));
	}
};

var cmdMap = { "help" : printHelp, "log" : loglevel }; //log debug라고 console치면 debug레벨로 변경됨

process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data',function(param){
	var paramArray = param.split(' ');
	var cmd = paramArray.shift();
	try {
		cmdMap[cmd.trim()](paramArray);
	} catch(ex) { 
		cmdMap.help();		
	}
});


module.exports = app;
