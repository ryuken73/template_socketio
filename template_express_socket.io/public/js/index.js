// client code

$(document).ready(function(){
	
    // electron에서 구동시키는 경우를 대비해서
	// index.html에서 미리 require를 window.nodeRequire로 바꿔놓았었다.
	
    if(typeof(window.nodeRequire) !== 'undefined'){
    	
    	// Electron Client에 필요한 코딩을 아래에 기술한다.
    	console.log('Electron Env');
    	
    	// Restore "require"
	    var require = window.nodeRequire;
	    
	    // Use node.js API   
    	var fs = require('fs');
    	var path = require('path');
    	var url = require('url');
    	
    	// process current execution directory
    	var cwd = process.cwd(); // when used electron .
    	var resourcesPath = process.resourcesPath ; // when used in exe
    	var cwdCfgFile = path.resolve(path.join(cwd), 'config.json');
    	var resourcesCfgFile = path.resolve(path.join(resourcesPath), 'app.asar', 'config.json');

    	var configFile;
    	
    	if(fs.existsSync(cwdCfgFile)){
    		configFile = cwdCfgFile;
    	}else if(fs.existsSync(resourcesCfgFile)){
    		configFile = resourcesCfgFile;
    	}else{
    			console.log('file not found');
    	}
    		  	
    	// Read local config file using node fs module
		
    	var configObj = JSON.parse(fs.readFileSync(configFile));
    	console.log(configObj);

    	$('#last').append('<div> Server : <span id=server class="editable" contenteditable="true" >' + configObj.url +'</span></div>');
    	$('#last').append('<div> Group : <span id=group class="editable" contenteditable="true" >' + configObj.groupNM +'</span></div>');
    	
    	
    	var remote = require('electron').remote;
    	remote.getCurrentWindow().on('did-finsh-load',function(){
    		console.log('loaded');
    		configObj.url = $('#server').text();
    		configObj.group = $('#group').text();
    		console.log(configObj);
    	})
    	
    	
    	$('#server').blur(function(){
    		console.log($(this).text());
    		configObj.url = $(this).text();
    		ipcRenderer.send('asynchronous-message', 'ping')
    		//TODO : need check connectivity
    		fs.writeFileSync(configFile,JSON.stringify(configObj));
    		remote.getCurrentWindow().loadURL(configObj.url + configObj.groupNM);
    	});
    	$('#group').blur(function(){
    		console.log($(this).text());
    		configObj.groupNM = $(this).text();
    		fs.writeFileSync(configFile,JSON.stringify(configObj));
    		remote.getCurrentWindow().loadURL(configObj.url + configObj.groupNM);
    	});
    	
    }else{
    	// Browser Client
    	console.log('browser env');
    }

	var socket = io();
	handleConnect(socket);
	haneleTime(socket);
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
		$('#connection_status').text('connected');
		$('.row').attr('class','row enabled');
		$('#connection_status').attr('class','connected');
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
		$('#connection_status').text('disconnected');
		$('.row').attr('class','row disabled');
		$('#connection_status').attr('class','disconnected');
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

function haneleTime(socket){
	
	socket.on('request client time',function(){
		console.log('receive request client time');
		var clientTime = getEpochTime();
		var alias = $('#alias').val() ? $('#alias').val() : "none";
		socket.emit('response client time', {clientTime:clientTime, socketID:socketID, alias:alias});		
	})
	
	socket.on('send server time', function(data){
		console.log(data.clientTime);
		console.log(data.serverTime);
		var clientDate = epochToDateObj(data.clientTime);
		var serverDate = epochToDateObj(data.serverTime);
		//console.log(clientDate);
		//console.log(serverDate);
		$('#local').text(clientDate);
		$('#remote').text(serverDate);
		$('#offset').text(data.clientTime - data.serverTime);	
		socket.emit('receive server time');
		
	})

}
