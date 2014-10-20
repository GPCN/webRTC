var server = require('http').createServer();
var app = server.listen(1503);
var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
	socket.on('join', function(room)
	{
		socket.join(room);
	});
	
    socket.on('message', function(message) 
	{
		console.log(message.command);
        io.in(socket.rooms[1]).emit('message', message);
    });
	
	socket.on('disconnect', function () {
		//console.log("disconnect");
		//
		
	});
});