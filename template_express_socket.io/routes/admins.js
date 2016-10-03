var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	global.logger.trace('req obj : %j',req);
    res.render('admin');
});

router.get('/:roomNM', function(req, res, next){
	global.logger.trace('room %s requested', req.params.roomNM)
	res.render('rooms');
});

module.exports = router;
