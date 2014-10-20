var pubnub = null;
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();


function HopanDataChannel(channel)
{
	this.userid = guid();
	this.ready = false;
	this.isstart = false;
	this.peerlist = [];
	this.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
	//
	this.onopen = null;
	this.onmessage = null;
	this.onleave = null;
	this.onready = null;

	//
	this.leave = function()
	{
		this.sendCommand("leave");
	}
	
	this.reject = function(id)
	{
		var i = this.getPeerIndexById(id);
		if (i != -1)
		{
			this.peerlist.splice(i);
		}
	}
	
	this.sendMessage = function(message)
	{
		//pubnub.publish({
		//	channel: this.channel,
		//	message: {id: this.userid, content: message}
		//});
		pubnub.send({id: this.userid, content: message});
	}
	
	this.sendMessage = function(message, toid)
	{
		//console.log("sendMessage", message, toid);
		//pubnub.publish({
		//	channel: this.channel,
		//	message: {id: this.userid, content: message, toid : toid}
		//});
		pubnub.send({id: this.userid, content: message, toid : toid});
	}
	
	this.send = this.sendMessage;
	
	this.sendCommand = function(command, param)
	{
		//pubnub.publish({
		//	channel: this.channel,
		//	message: {id: this.userid, type : "control", command : command, param: param}
		//});
		//console.log(command);
		pubnub.send({id: this.userid, type : "control", command : command, param: param});
	}
	
	this.gotPublicPubMessage = function(message)
	{
		//console.log(message.id);
		if (!this.isstart) return;
		//
		if (message.id == this.userid)
		{
			//console.log(message);
		}
		else if (message.type == "control")
		{
			if (message.command == "leave")
			{
				//console.log("leave");
				if (this.onleave) this.onleave(message.id);
				//
				var i = this.getPeerIndexById(message.id);
				if (i != -1)
				{
					this.peerlist.splice(i);
				}
			}
			else if (message.command == "ping")
			{
				//console.log("ping");
				var i = this.getPeerIndexById(message.id);
				if (i != -1)
				{
					this.peerlist[i].lastTime = (new Date).getTime();
				}
				else
				{
					this.peerlist[this.peerlist.length] = {id : message.id, lastTime : (new Date).getTime()};
					//console.log(message.id, "join room");
					if (this.onopen) this.onopen(message.id);
				}
				
			}
		}
		else if (!message.toid || message.toid == this.userid)
		{
			if (this.onmessage) this.onmessage(message.content, message.id);			
		}
	}

	this.gotPublicConnect = function()
	{
		//console.log("connected");
		this.ready = true;
		if(this.onready) this.onready();
	}
	
	this.getPeerIndexById = function(id)
	{
		for (var i = 0; i < this.peerlist.length; ++i)
		{
			if (this.peerlist[i].id == id) return i;
		}
		
		return -1;
	}
	
	var self = this;
	/* pubnub.subscribe({
		channel: this.channel,
		callback: function(message){self.gotPublicPubMessage(message)},
		connect: function(){self.gotPublicConnect()},
	}); */
	pubnub = new localpubnub(this.channel);
	pubnub.onmessage = function(message){self.gotPublicPubMessage(message)};
	pubnub.onconnected = function(){self.gotPublicConnect()};
	
	//
	this.start = function()
	{
		
		this.isstart = true;
		this.mtInverval = setInterval(function()
		{
			self.sendCommand("ping");
			//self.sendMessage("lav");
			// scan list
			for (var i = 0; i < self.peerlist.length; ++i)
			{
				var entry = self.peerlist[i];
				//
				if ((new Date).getTime() - entry.lastTime > 3000)
				{
					self.peerlist.splice(i);
					//console.log(entry.id, "leave the room!");
					if (self.onleave) self.onleave(entry.id);
				}
			}
		}, 1000);
	}
}


