var _ = require('lodash');
var Q = require('q');

module.exports = function(socket, io){
	
	//make admin client to send request
	socket.emit('server-to-client init')

	socket.on('client-to-server reqStatus',function(data){
		
		// get client info objects
		// looks like below
		/*
		   {
		      socket.id : 
		         { roomNM:'xxx', 
		           remoteAddr:'x.x.x.x',
		           tMonOffset : x,
		           tMonStatus : 'GOOD',
		          },
		      socket.id :
		   } 
		*/            
		var clients = io.of('/').connected;
		global.logger.trace('get adminInit');
		global.logger.trace(getClientCnt(io));

		getRooms(clients) // get room array [ room1, room2 ]
		.then(addClient) // add client to each room { room1 : [sockid1,sockid2], room2 : [sockid] }
		.then(addStatus) // add client status to each client { room1 : [ {id:socketid1, remoeAddr:'x', tMonOffset:x, tMonStatus:x},{}]
		.then(mkSummary) // make summary [{roomNM:room name, connected: number of client, status:{good:0,warn:1,fail:0},{roomNM:..]
		.then(function(result){
			global.logger.trace(result);
			socket.emit('server-to-client resStatus',result)
		})
		.then(null, function(err){
			global.logger.error(err);
		});
	});
	
	socket.on('client-to-server resDone',function(data){
		setTimeout(function(){
			socket.emit('server-to-client init');
		},1000)		
	})
};

function getRooms(clients){
	
	// return room array [room1, room2...]

	var def = Q.defer()	;
	
	// make each socket.id objects value to be room name
	// {sid1:'room`', sid2;'room1'..}
	var roomObjs = _.mapValues(clients,'roomNM');
	global.logger.trace('room Object = %j', roomObjs)
	
	//make room name array
	var roomArry = _.values(roomObjs);
	var roomArryFilterNull = _.compact(roomArry); // so simple
	global.logger.trace('room Array exlude admin = %j',roomArryFilterNull); 

	def.resolve({clients:clients, roomArry:roomArryFilterNull}); 
	
	return def.promise;
}

function addClient(obj){
	
	// return room object having room name as a key and socket array as value
	// {room1:[socketid1, socketid2], room2:[socketid3]...}	

	global.logger.trace('addClient start');

	var def = Q.defer();	
	
	var roomObj = _.reduce(obj.roomArry, function( result, roomNM ) {
						var socketsInRoom =  _.filter(obj.clients, ['roomNM',roomNM]);
						var clientsInRoom  =  _.map(socketsInRoom, 'id');
						global.logger.trace(clientsInRoom);
						result[roomNM] = clientsInRoom;
						return result
				}, {});
	
	global.logger.trace('result of addClient : %j',roomObj);
	obj.roomObj = roomObj;
	def.resolve(obj);
	return def.promise;	
}

function addStatus(obj){
	// obj == { clients:clients, roomArry:[room1,room2..], roomObj:{room1:[socketid1,socketid2], room2:..}
	// return  { room1 : [ {id:socketid1, remoeAddr:'x', tMonOffset:x, tMonStatus:x},{}]
	var def = Q.defer();
	global.logger.trace(obj.roomObj);
	var count = _.size(obj.roomObj);
	for ( key in obj.roomObj ){
		var sockets = obj.roomObj[key];
		obj.roomObj[key] = sockets.map(function(socketID){
			var addr = obj.clients[socketID].remoteAddr;
			var offset = obj.clients[socketID].tMonOffset;
			var status = obj.clients[socketID].tMonStatus;
			var clientTime = obj.clients[socketID].clientTime;
			var serverTime = obj.clients[socketID].serverTime;
			var result = {id:socketID, remoteAddr:addr, tMonOffset:offset, tMonStatus:status, clientTime:clientTime, serverTime:serverTime};		
	
			return result
		})
		count--;
		if(count === 0){
			def.resolve(obj.roomObj)
		}
	};
	return def.promise;	
}

function mkSummary(obj){
	var def = Q.defer();
	// obj == {room name : [ {id:socketid1, remoeAddr:'x', tMonOffset:x, tMonStatus:x},{}..], room name : [...]}
	// return [{roomNM:room name, connected: number of client, status:{good:0,warn:1,fail:0},{roomNM:..]
	var summary = _.map(obj,function(value, key, collection){
							var result = {};
							var roomNM = key;
							var size = _.size(value);
							var statusList = _.map(value,'tMonStatus');
							var statusObj = _.countBy(statusList, function(status){return status;});
							
							result['roomNM'] = roomNM; 
							result['connected'] = size;
							result['status'] = statusObj; 
							return result
						})
						
	global.logger.trace('summary : %j', summary);	
	def.resolve(summary);
	
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
