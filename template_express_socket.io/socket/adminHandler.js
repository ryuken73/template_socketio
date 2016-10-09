var _ = require('lodash');
var Q = require('q');

module.exports = function(socket, io){

	socket.on('reqAdminRefresh',function(data){
		// get client info objects
		var clients = io.of('/').connected;
		global.logger.trace('get adminInit');
		global.logger.trace(getClientCnt(io));

		getRooms(clients)
		.then(addClient)
		.then(addStatus)
		.then(function(result){
			global.logger.trace(result);
		})
		/*
		for ( key in clients){
			console.log(key)
			console.log(clients[key].roomNM)
			console.log(clients[key].remoteAddr)
			console.log(clients[key].tMonOffset)
			console.log(clients[key].tMonStatus)
		} 
		*/
		socket.emit('resAdminRefresh',{})
	});
}

function getRooms(clients){
	
	// return room array [room1, room2...]

	var def = Q.defer()	;
	
	//make each socket.id objects value to be room name
	//{sid1:'room`', sid2;'room1'..}
	var roomObjs = _.mapValues(clients,'roomNM');
	global.logger.trace('room Object = %j', roomObjs)
	
	//make room name array
	var roomArry = _.values(roomObjs);
	var roomArryFilterNull = _.difference(roomArry,[undefined]);

	global.logger.trace('room Array exlude admin = %j',roomArryFilterNull); 

	def.resolve(clients, roomArryFilterNull); 
	
	return def.promise;
}

function addClient(clients, roomArry){
	
	// return room object {room1:[socketid1, socketid2], room2:[socketid3]...}	

	global.logger.trace('addClient start');

	var def = Q.defer();
	var result = {};	
	
	//make each socket.id objects value to be room name
	//{sid1:'room`', sid2;'room1'..}
	var roomObjs = _.mapValues(clients,'roomNM');	
	
	roomArry.forEach(function(roomNM){
		var clientsInRoom = _.keys(_.filter(clients,['roomNM',roomNM]));
		global.logger.trace('room in %s is %j',roomNM, clientsInRoom);
		
	})
	def.resolve(clients, roomArry);
	return def.promise;	
}

function addStatus(clients, result){
	var def = Q.defer();
	def.resolve(result)
	return def.promise;
	
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
	// return total socket client connected
	return _.size(io.of('/').connected)
}
