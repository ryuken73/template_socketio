var express = require('express');
var router = express.Router();

/* change in master */
/* GET home page. */
router.get('/', function(req, res, next) {
	global.logger.trace('req obj : %j',req);
  res.render('index', { title: 'Express 1' });
});

module.exports = router;      
