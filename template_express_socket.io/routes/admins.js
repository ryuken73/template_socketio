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

function makeKey(name){
	return name + ':maxCnt'
}

router.get('/getHighCnt/:groupNM',function(req,res,next){
	
	var k = makeKey(req.params.groupNM);

	global.db.get(k, function(err,count){
		if(err){
			global.logger.error(err);
			res.send({'result':null});
		}else{
			res.send({'result':count});
		}
	});
});

router.post('/putHighCnt/:groupNM', function(req,res,next){
	var k = makeKey(req.params.groupNM);
	var v = req.body.count;
	global.logger.info(k);
	global.logger.info(v);
	
	global.db.put(k,v,function(err){
		if(err){
			global.logger.error(err);
			res.send({'result':'fail'});
		}else{
			res.send({'result':'success'});
		}
	});	
})

module.exports = router;
