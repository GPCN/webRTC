var pubnub = PUBNUB.init({
publish_key: 'pub-c-97223e80-568d-4ee9-8bf7-b8f04d5767be',
subscribe_key: 'sub-c-315bcd98-16d4-11e4-81b7-02ee2ddab7fe'
});

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
	this.peerlist = [];
	this.date = new Date();
	this.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
	//
	this.onopen = null;
	this.onmessage = null;
	this.onleave = null;
	
	//
	this.reject = function()
	{
		this.sendCommand("reject");
	}
	
	this.sendMessage = function(message)
	{
		pubnub.publish({
			channel: channel,
			message: {id: this.id, content: message}
		});
	}
	
	this.sendMessage = function(message, toid)
	{
		pubnub.publish({
			channel: channel,
			message: {id: this.id, content: message, toid : toid}
		});
	}
	
	
	this.sendCommand = function(command, param)
	{
		pubnub.publish({
			channel: command,
			message: {id: this.id, type : "control", command : command, param: param}
		});
	}
	
	pubnub.subscribe({
		channel: this.channel,
		callback: this.gotPublicPubMessage,
		connect: this.gotPublicConnect
	});
	
	
	this.gotPublicPubMessage = function (message)
	{
		if (message.id == this.userid)
		{
			
		}
		else if (message.type == "control")
		{
			if (message.command == "reject")
			{
				if (onleave) onleave(message.id);
				//
				var i == this.getPeerIndexById(message.id);
				if (i != -1)
				{
					this.peerlist.splice(i);
				}
			}
			else if (message.command == "ping")
			{
				var i == this.getPeerIndexById(message.id);
				if (i != -1)
				{
					this.peerlist[i].lastTime = this.date.getTime();
				}
				else
				{
					this.peerlist[this.peerlist.length] = {id : message.id, lastTime : this.date.getTime()};
					if (onopen) onopen(message.id);
				}
				
			}
		}
		else if (!message.toid || message.toid == this.userid)
		{
			if (onmessage) onmessage(message.content, message.id);
		}
	}

	this.gotPublicConnect = function ()
	{
		this.ready = true;
		this.sendCommand("ping");
	}
	
	this.getPeerIndexById = function(id)
	{
		for (var i = 0; i < this.peerlist.length; ++i)
		{
			if (this.peerlist[i].id == id) return i;
		}
		
		return -1;
	}
	
	var mtInverval = setInterval(function()
	{
		this.sendCommand("ping");
		// scan list
		for (var i = 0; i < this.peerlist.length; ++i)
		{
			var entry = this.peerlist[i];
			//
			if (this.date.getTime() - entry.lastTime > 2000)
			{
				this.peerlist.splice(i);
				if (onleave) onleave(entry.id);
			}
		}

	}, 1000);
}





