
function localpubnub(channel)
{
	this.socket = io.connect('http://127.0.0.1:1503/');
	this.channelReady = false;
	this.onmessage = null;
	this.onconnected = null;
	
	var self = this;

	this.onChannelOpened = function(evt) {
		self.channelReady = true;
		self.socket.emit("join", channel);
		//self.socket.emit("message", "hello world");
		if (self.onconnected) self.onconnected();
	}
	
	this.socket.on('connect', this.onChannelOpened);

	this.socket.on('message', function(msg){
		if (self.onmessage) self.onmessage(msg);
	});
	
	this.send = function(message)
	{
		this.socket.emit("message", message);
	}
}
