var _ = require('lodash');
var Q = require('q');
var dateUtil = require('../lib/dateToString');

module.exports = function(socket, io){	

		// return 
		/*
		   [
		         { socketID : 'xxx',
		           roomNM:'xxx', 
		           remoteAddr:'x.x.x.x',
		           tMonOffset : x,
		           tMonStatus : 'GOOD',
		          },
		   ] 
		*/            
		var clients = io.of('/').connected;
		global.logger.trace(getClientCnt(io));
		
		getSocketIDs(clients) // get all socket id array
		.then(addStatus) 
		.then(function(result){
			//global.logger.trace(result);
			io.emit('server-to-client resAllStatus',result);
		})
		.then(null, function(err){
			global.logger.error(err);
		});
	
}

function getSocketIDs(clients){
	
	// return socket IDs array [id1, id2]

	var def = Q.defer()	;
	def.resolve({clients:clients, sockets:_.keys(clients)});
	return def.promise;

}

function addStatus(obj){
	// obj == { clients:clients, sockets:[socketid1,socketid2] }
	// return  [ { socketID:xx, roomNM:xx, remoteAddr:xx, tMonOffset:x, tMonStatus:xx } ]
	var def = Q.defer();
	
	var sockets = obj.sockets;
	var allStatus = sockets.map(function(socketID){
		var roomNM = obj.clients[socketID].roomNM;
		var addr = obj.clients[socketID].remoteAddr;
		var offset = obj.clients[socketID].tMonOffset;
		var status = obj.clients[socketID].tMonStatus;
		var clientTime = obj.clients[socketID].clientTime;
		var serverTime = obj.clients[socketID].serverTime;
		var alias =  obj.clients[socketID].alias;
		var result = {socketID:socketID, roomNM:roomNM,remoteAddr:addr, tMonOffset:offset, tMonStatus:status, clientTime:clientTime, serverTime:serverTime, alias:alias };		
	
		return result
	});
	

	var exceptAdmin = _.filter(allStatus, function(o){
		if(o.roomNM){
			return true
		}  
	})	

	def.resolve(exceptAdmin);
	
	return def.promise;	
}


function getClientCnt(io) {
	// return total socket client connected
	return _.size(io.of('/').connected)
}