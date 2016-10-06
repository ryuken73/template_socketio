var _ = require('lodash');
var Q = require('q');

module.exports = function(socket, io){

	socket.on('reqAdminRefresh',function(data){
		var clients = io.of('/').connected;
		global.logger.trace('get adminInit');
		global.logger.trace(getClientCnt(io));
		getStatus(clients)
		.then(function(status){
			global.logger.trace(status)
		})
		for ( key in clients){
			console.log(key)
			console.log(clients[key].rooms)
			console.log(clients[key].remoteAddr)
			console.log(clients[key].tMonOffset)
			console.log(clients[key].tMonStatus)
		} 
		socket.emit('resAdminRefresh',{})
	});
}

function getStatus(clients){
	
	var def = Q.defer()	
	var result = {};
	
	for (key in clients){
		var myRoom = 'root'
		for (roomNM in clients[key].rooms){
			if(roomNM !== key){
				myRoom = roomNM;	
			}
		}
		
	}
	
	return def.promise;
	
}

function getClientCnt(io) {
	return _.size(io.of('/').connected)
}
