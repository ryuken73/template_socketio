// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);

})

	
function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
		$('#connection_status').text('connected');
		//$('.row').attr('class','row enabled');
		$('#connection_status').attr('class','connected');
	})
    /*
	
	socket.on('setID',function(data){
		console.log(data);
		var socketID = data.socketID;
		var room = 'admin';
	
		console.log('joinRoom : ' + room + ' : ' + socketID);
		socket.emit('joinRoom',{ roomNM : room });
		socket.on('joinResult',function(data){
			console.log('node joined : ' + data.ip);
			//TODO :  refresh same room member list : IP address
		});   		
	})
	*/	
	
	handleDisconnect(socket);	
    handleSummaryRefesh(socket);
    handleDetailRefresh(socket);
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
		$('#connection_status').text('disconnected');
		//$('.row').attr('class','row disabled');
		$('#connection_status').attr('class','disconnected');
	})
}

function handleDetailRefresh(socket){
	
	/*
	socket.on('adminDetail-server-to-client init',function(data){
		//console.log('send req to server');
		socket.emit('client-to-server reqAllStatus');
	});
	0314 */ 
	
	socket.on('server-to-client resAllStatus', function(data){	
		console.log('got res from server');
		removeDetail(data);
		updateDetail(data);
		addDetail(data);
		socket.emit('client-to-server resAllStatusDone');	
	});
	
}

function removeDetail(data){

	var noData = _.reject($('.socket') ,function(element){
		var socketID = element.id;
		return _.some(data,['socketID',socketID]);
	})
	//console.log(noData);
	
	_.forEach(noData, function(element){
		$('#' + element.id).remove();
	})		
	
}

 
function updateDetail(data){
	// update some rows which is in newly arrived data
	var updateData = _.filter(data, function(socket){
		var socketID = socket.socketID;
		return _.some($('.socket'),['id', socketID]);
	})
	updateData.forEach(function(socket){
		var diff = getTimeDiff(socket.clientTime, Date.now());	
		//console.log('update : ' + socket.socketID);
		var escapedID = socket.socketID.replace( /(:|\.|\/|\#|\-|\[|_|\]|,|=)/g, "\\$1" );
		//console.log('escaped : ' + escapedID);
		var ipPlusAlias = socket.remoteAddr + ' : ' + socket.alias;
		$('#detail #'+escapedID+' #roomNM').text(socket.roomNM);
		//$('#detail #'+escapedID+' #addr').text(socket.remoteAddr);
		$('#detail #'+escapedID+' #addr').text(ipPlusAlias);
		$('#detail #'+escapedID+' #ctime').text(socket.clientTime);
		$('#detail #'+escapedID+' #stime').text(socket.serverTime);
		$('#detail #'+escapedID+' #offset').text(socket.tMonOffset);
		$('#detail #'+escapedID+' #status').text(socket.tMonStatus);		
		$('#detail #'+escapedID+' #last').text(diff);	
	}) 		
}


function addDetail(data){
	
	var newData = _.filter(data, function(socket){
		var socketID = socket.socketID;
		return !(_.some($('.socket'),['id', socketID]));
	});
	//console.log(newData);
	newData.forEach(function(socket){
		var diff = getTimeDiff(socket.clientTime, Date.now());		
		//console.log('append : ' + socket.socketID);
		var ipPlusAlias = socket.remoteAddr + ' : ' + socket.alias;
		var sockData = '<div id=' + socket.socketID + ' class = "row socket" groupNM =' + socket.roomNM + '>';
		sockData    +=   '<div id=roomNM class="two columns">' + socket.roomNM + '</div>';
		//sockData    +=   '<div id=addr class="two columns">' + socket.remoteAddr + '</div>';
		sockData    +=   '<div id=addr class="three columns">' + ipPlusAlias + '</div>';
		sockData    +=   '<div id=ctime class="two columns">' + socket.clientTime + '</div>';		
		sockData    +=   '<div id=stime class="two columns">' + socket.serverTime + '</div>';		
		sockData    +=   '<div id=offset class="one columns">' + socket.tMonOffset + '</div>';	
		sockData    +=   '<div id=status class="one columns">' + socket.tMonStatus + '</div>';				
		sockData    +=   '<div id=last class="one columns">' + diff + '</div>';		
		sockData     += '</div>  ';
		$('#detail').append(sockData);
		$('#'+socket.socketID+'.socket').hide();
	});
	
}

function handleSummaryRefesh(socket){
	socket.on('adminSummary-server-to-client init',function(data){
		//console.log('send req summary');
		socket.emit('client-to-server reqSummary');		
	});

	socket.on('server-to-client resSummary',function(data){		
		//console.log('get res summary');
		removeData(data);
		updateData(data);
		addData(data);
		chgHeader(data);
		socket.emit('client-to-server resSummaryDone');

	})
}   

function removeData(data){
 
	// remove some previous rows which is not in newly arrived data 
	var noData = _.reject($('.group') ,function(element){
		var roomNM = element.id;
		return _.some(data,['roomNM',roomNM]);
	})

	_.forEach(noData, function(element){
		$('#' + element.id).remove();
	})
}

function addData(data){
	
	// add new rows which is newly included in arrived data
	var newData = _.filter(data, function(group){
		var roomNM = group.roomNM;
		return !(_.some($('.group'),['id', roomNM]));
		
	});
	
	newData.forEach(function(group){
		
		getHighCnt(group)
		.then(function(ret){		
					console.log(ret);
					var count;
					if(ret.result === null){
						count = group.connected;
						putHighCnt(group);
					} else {
						count = ret.result;
					}	
					
					var diff = getTimeDiff(group.oldestServerTM, Date.now());
		
					//console.log('append : ' + group.roomNM);
					var statusHtml = mkSatusHtml(group.status);
					var rowData = '<div id=' + group.roomNM + ' class = "row group">'
					rowData     += '  <div id=groupNM class="two columns"><input type="checkbox" roomNM=' + group.roomNM + '> ' + group.roomNM + '</input></div>'	
					//rowData     += '  <div id=groupNM class="three columns"><button class="button">' + group.roomNM + '</button></div>'
					rowData     += '  <div id=connected class = "three columns">' + group.connected + ' / ' + count + '</div>'	
					rowData     += '  <div id=status class = "three columns">' + statusHtml + '</div>'
					rowData     += '  <div id=maxoffset class = "two columns">' + group.maxOffset + '</div>'
					rowData     += '  <div id=oldestClient class = "two columns">' + diff + '</div>'		 
					rowData     += '</div>  '; 
					$('#summary').append(rowData);
					if($('input[roomNM=' + group.roomNM + ']').is(":checked")){
						$('.socket[groupNM=' + group.roomNM + ']').show(); 
					}
					$('input[roomNM=' + group.roomNM + ']').change(function(){
						
						var someChecked = _.some($('input'), function(e){ 
							console.log(e.checked);
							return e.checked
						});
						  
						if(someChecked){
							$('#detailHeader').show();
						}else{
							$('#detailHeader').hide();
						}
						
						//console.log($(this).is(":checked"));
						if($(this).is(":checked")){
							$('.socket[groupNM=' + group.roomNM + ']').show();
						}else{
							$('.socket[groupNM=' + group.roomNM + ']').hide();				
						}
					})
					
					// add click event on connected to reset data
					$('#' + group.roomNM + ' #connected').click(function(){
						$(this).text('0 / 0');						
						putHighCnt({roomNM : group.roomNM, connected : 0});
					})
			
		})
	});	
}

function getHighCnt(group){
	var def = $.Deferred();
	$.ajax({
			url : '/admin/getHighCnt/' + group.roomNM,
			method : 'GET',
			type : 'application/json',
			success : function(ret){
				def.resolve(ret);
			}
	});
	return def.promise();
}

function putHighCnt(group){
	var def = $.Deferred();
	
	$.ajax({
		url : '/admin/putHighCnt/' + group.roomNM,
		method : 'POST',
		type : 'application/json',
		data : {'count':group.connected},
		success : function(ret){				
			def.resolve(ret);
		}
	})
	
	return def.promise();
	
}

function mkSatusHtml(status){
	var numGood = status.GOOD ? status.GOOD:0;
	var numWarn = status.WARN ? status.WARN:0;
	var numFail = status.FAIL ? status.FAIL:0;
	
	var good = '<span class="good">Good:' + numGood + ' </span>';
	var warn = '<span class="warn">Warn:' + numWarn + ' </span>';
	var fail = '<span class="fail">Fail:' + numFail + ' </span>';
	return good + ' / ' + warn + ' / ' + fail;
} 

function updateData(data){
	// update some rows which is in newly arrived data
	var updateData = _.filter(data, function(group){ 
		var roomNM = group.roomNM;
		return _.some($('.group'),['id', roomNM]);
	})
	updateData.forEach(function(group){
			
		//console.log('update : ' + group.roomNM);
		
		getHighCnt(group)
		.then(function(ret){
					var count;
					if((ret.result === null) || (ret.result < group.connected)){
						count = group.connected;
						putHighCnt(group);
					} else {
						count = ret.result;
					}
					
					var diff = getTimeDiff(group.oldestServerTM, Date.now());
					
					var statusHtml = mkSatusHtml(group.status);
					$('#summary #'+group.roomNM+' #connected').text(group.connected + ' / ' + count);
					$('#summary #'+group.roomNM+' #status').html(statusHtml);
					$('#summary #'+group.roomNM+' #maxoffset').text(group.maxOffset);		
					$('#summary #'+group.roomNM+' #oldestClient').text(diff);		
					
					if($('input[roomNM=' + group.roomNM + ']').is(":checked")){
						$('.socket[groupNM=' + group.roomNM + ']').show();
					}					
					
		})
		

	}) 
}


function chgHeader(data){
	// change total Connected
	var connected = _.reduce(data, function(result,value,key,collection){
		return result + value.connected	
	},0);
	$('#connected').text(connected);      
	// change last update time 
	var date = new Date();
	$('#lastUpdated').text(date);	
}

function getTimeDiff(time1, time2){
	return time2 - time1;
}