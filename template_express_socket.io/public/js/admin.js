// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
})

	
function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
		handleDisconnect(socket);
        handleRefesh(socket)
	})
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
	})
}

function handleRefesh(socket){
	socket.on('server-to-client init',function(data){
		socket.emit('client-to-server reqStatus');		
	});
	
	socket.on('server-to-client resStatus',function(data){		
		removeData(data);
		updateData(data);
		addData(data);
		socket.emit('client-to-server resDone');
		/*
		console.log(data.root[0].tMonStatus);
		socket.emit('client-to-server resDone');
		$('#addr').text(data.root[0].remoteAddr);
		$('#clientTime').text(data.root[0].clientTime);
		$('#serverTime').text(data.root[0].serverTime);
		$('#offset').text(data.root[0].tMonOffset);
		$('#state').text(data.root[0].tMonStatus);
		*/

	})
}   

function removeData(data){

	var noData = _.reject($('.group') ,function(element){
		var roomNM = element.id;
		return _.some(data,['roomNM',roomNM]);
	})

	_.forEach(noData, function(element){
		$('#' + element.id).remove();
	})
}

function addData(data){
	var newData = _.filter(data, function(group){
		var roomNM = group.roomNM;
		return !(_.some($('.group'),['id', roomNM]));
		
	})
	newData.forEach(function(group){
		console.log('append : ' + group.roomNM);
		var rowData = '<div id=' + group.roomNM + ' class = "row group">'
		rowData     += '  <div id=groupNM class="one-third column">' + group.roomNM + '</div>'	
		rowData     += '  <div id=connected class = "one-third column">' + group.connected + '</div>'	
		rowData     += '  <div id=status class = "one-third column">' + JSON.stringify(group.status) + '</div>'	
		rowData     += '</div>  ';
		$('#summary').append(rowData);
	})
}

function updateData(data){
	var updateData = _.filter(data, function(group){
		var roomNM = group.roomNM;
		return _.some($('.group'),['id', roomNM]);
	})
	updateData.forEach(function(group){
		console.log('update : ' + group.roomNM);
		$('#summary #'+group.roomNM+' #connected').text(group.connected);
		$('#summary #'+group.roomNM+' #status').text(JSON.stringify(group.status));
		
	})
}