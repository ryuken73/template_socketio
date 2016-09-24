// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
	reqTimeLoop(socket);
})

	
function getEpochTime(){
	var date = new Date();
	return date.getTime();
}

function epochToDateObj(time){
	var date = new Date(time);
	return date;
}


function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
	})
	socket.on('setID',function(data){
		console.log(data);
		socketID = data.socketID;
		handleRoom(socket);
		handleDisconnect(socket);
		//handleConnectError(socket);
		//handleConnectTimeout(socket);
		//handleReconnecting(socket);		
	})
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
	})
}

function handleRoom(socket){
	var room = location.pathname.split('/')[1] ? location.pathname.split('/')[1]:'root';
	console.log('joinRoom : ' + room + ' : ' + socketID);
	socket.emit('joinRoom',{ roomNM : room });
	socket.on('joinResult',function(data){
		console.log('node joined : ' + data.ip);
		//TODO :  refresh same room member list : IP address
	});   
}

function reqTimeLoop(socket){
	setTimeout(function(){
		console.log('request Time')
		var clientTime = getEpochTime();
		socket.emit('reqServerTime',{clientTime:clientTime});
		socket.on('resServerTime',function(data){
			console.log(clientTime);
			console.log(data.serverTime);
			var clientDate = epochToDateObj(clientTime);
			var serverDate = epochToDateObj(data.serverTime);
			//console.log(clientDate);
			//console.log(serverDate);
			$('#local').text(clientDate);
			$('#remote').text(serverDate);
			$('#offset').text(clientTime - data.serverTime);
		});
		reqTimeLoop(socket)		
	},1000);
}
