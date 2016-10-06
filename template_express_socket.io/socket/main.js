/**
 * New node file
 */
var adminHandler = require('./adminHandler');
var Q = require('q'); 

exports.bind = function(io){

	io.on('connection',function(socket){

		welcomConnect(socket);    
		joinRoom(socket, io);    
		handleTime(socket, io);
		
		// for http://host.domain/admin
		adminHandler(socket, io);
	});
}; 

function welcomConnect(socket){
	//three ways to get client ip address
	//global.logger.trace(socket.handshake.address);
	//global.logger.trace(socket.request.connection.remoteAddress);
	//global.logger.trace(socket.conn.remoteAddress);	
	
	var remoteAddr = socket.request.connection.remoteAddress.replace('::ffff:','');
	global.logger.info('client connected : %s', remoteAddr);
	socket.remoteAddr = remoteAddr;
	 
    //stateless server를 위해서...    
	//socketid를 client로 내려준다. 서버에서 관리하는 socketid는 없다.
	socket.emit('setID',{socketID:socket.id}); 
	
}

function joinRoom(socket, io){
	socket.on('joinRoom',function(data){
		global.logger.trace('joinRoom : %j : %s', data.roomNM, socket.id);
		socket.join(data.roomNM);
		io.to(data.roomNM).emit('joinResult',{ip:socket.remoteAddr});
	});
}

function handleTime(socket, io){
	socket.on('reqServerTime', function(data){
		global.logger.trace('reqServerTime : %s : %s : %s', socket.remoteAddr, data.clientTime, data.socketID);
		//var roomNM = getRoomBySocketID(data.socketID, io);
		global.logger.trace(socket.rooms);
		var clientTime = data.clientTime;
		var serverTime = getEpochTime();
		socket.emit('resServerTime', { serverTime:serverTime });	
		
		var offset = Math.abs(serverTime - clientTime);
		getStatus(offset)
		.then(function(status){
			global.logger.info('status of %s(%s) is %s (%d ms)',socket.id,socket.remoteAddr,status, offset)
			io.of('/').connected[socket.id].tMonOffset = offset;
			io.of('/').connected[socket.id].tMonStatus = status;

		})
	});
}

function getStatus(diff){
	var def = Q.defer()
	
	for ( key in global.status ) {
		if(global.status[key].low < diff && global.status[key].high > diff){
			console.log('reslove')
			//def.resolve(global.status[key].level)
			def.resolve(global.status[key].Level);
		}	
	}
	return def.promise
}

function getEpochTime(){
	var date = new Date(); 
	return date.getTime();
}
 
function epochToDateObj(time){
	var date = new Date(time);
	return date;
}

/*
function reqTime(socket,io){
	setTimeout(function(){
		global.logger.trace('request Time : %s',socket.remoteAddr);
		socket.emit('reqTime',{reqStart:100});
		//reqTime(socket,io);
	},1000);
}
*/