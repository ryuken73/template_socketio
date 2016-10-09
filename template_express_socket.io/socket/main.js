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
		// attach room name on socket.roomNM
		socket.roomNM = data.roomNM;
		io.to(data.roomNM).emit('joinResult',{ip:socket.remoteAddr});
	});
}

function handleTime(socket, io){
	
	socket.on('reqServerTime', function(data){
		global.logger.trace('reqServerTime : %s : %s : %s', socket.remoteAddr, data.clientTime, data.socketID);
		var roomNM = socket.roomNM;
		var clientTime = data.clientTime;
		var serverTime = getEpochTime();
		socket.emit('resServerTime', { serverTime:serverTime });	
		
		var offset = Math.abs(serverTime - clientTime); // difference between server and client
		getStatus(offset)
		.then(function(status){
			global.logger.info('status of %s(%s) is %s (%d ms)',socket.id,socket.remoteAddr,status, offset)
			// attach time difference, status and room name on io objects
			// can be accessed by io.of(nsp).connected objects ( represent all connected socket )
			var socketInIO = io.of('/').connected[socket.id];
			socketInIO.tMonOffset = offset;
			socketInIO.tMonStatus = status;
			socketInIO.roomNM = roomNM

		})
	});
}

function getStatus(diff){
	
	// return time sync status based on global.status in app.js
	
	var def = Q.defer()
	
	for ( key in global.status ) {
		if(global.status[key].low < diff && global.status[key].high > diff){
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