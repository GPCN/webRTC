console.log("Start Demo");

// 
// message {type,content}

// Vars
var channel = new HopanDataChannel();
var isConnected = false;
var peerManager = new PeerManager();
var createRoom = document.getElementById("createRoom");
var videosContainer = document.getElementById("videos");
var peerConnection = null;
var localStream = null;
var currentPeer = null;
var callanswerList = [];
var avatar = null;

var STUN = {
    url: 'stun:stun.l.google.com:19302' 
};

var TURN = {
    url: 'turn:homeo@turn.bistri.com:80',
    credential: 'homeo'
};

var iceServers = {
   iceServers: [STUN, TURN]
};

// Check room

var roomId = getURLParameter("room");


// Classes
function Peer(id) {
    this.id = id;
	this.nickname = "";
	this.avatar = null;
    this.pc = new webkitRTCPeerConnection(iceServers);
	this.pc.addStream(localStream);
	this.startcall = false;
	//
	this.gotStream = function(event)
	{
		var index = peerManager.getPeerIndexByPC(this);
		if (index != -1)
		{
			addVideo(event.stream, peerManager.peers[index].id);
			// send avatar
			//console.log(avatar.src);
			peerManager.peers[index].sendMessage({type: "avatar", content: avatar.src});
		}
	}
	
	this.gotStateChange = function()
	{
		//console.log("stateChange");
	}
	
	this.gotIceCandidate = function(event)
	{
		var index = peerManager.getPeerIndexByPC(this);
		if (event.candidate && index != -1)
		{
			peerManager.peers[index].sendMessage({type:"candidate", content: event.candidate});
		}
	}
	
	this.gotOfferDescription = function(des)
	{
		console.log("Got Description", des);
		currentPeer.pc.setLocalDescription(des);
		currentPeer.sendMessage({type:"description", content: des, state: "offer"});
		currentPeer = null;
	}
	

	
	this.gotAnswerDescription = function(des)
	{
		console.log("Got Description", des);
		currentPeer.pc.setLocalDescription(des);
		currentPeer.sendMessage({type:"description", content: des, state: "answer"});
		currentPeer = null;
	}
	
	this.sendMessage = function(message)
	{
		message.id = this.id;
		channel.send(JSON.stringify(message));
	}
	
	this.startCall = function()
	{
		//console.log("Start Call");
		//currentPeer = this;
		//this.pc.onaddstream = this.gotStream;
		//this.pc.onicecandidate = this.gotIceCandidate;
		//this.pc.onsignalingstatechange = this.gotStateChange;
		//this.pc.addStream(localStream);
		//this.pc.createOffer(this.gotOfferDescription);
		this.startcall = true;
		callanswerList[callanswerList.length] = {type:"call", peer : this};
	}
	
	this.startAnswer = function()
	{
		//console.log("createAnswer");
		// Create answer
		//currentPeer = this;
		//this.pc.onaddstream = this.gotStream;
		//this.pc.onicecandidate = this.gotIceCandidate;
		//this.pc.onsignalingstatechange = this.gotStateChange;
		//this.pc.addStream(localStream);
		//this.pc.createAnswer(this.gotAnswerDescription);
		this.startcall = true;
		callanswerList[callanswerList.length] = {type:"answer", peer : this};
	}
	
	this.gotMessage = function(message)
	{
		// process message
		//console.log("gotMessage", message);
		var msg = JSON.parse(message);
		//
		if (msg.id && msg.id != channel.userid) return;
		//
		if (msg.type == "offer")
		{
			this.sendMessage({type: "call"});
		}
		else if (msg.type == "call")
		{
			this.startCall();
		}
		else if (msg.type == "candidate")
		{
			//console.log("candidate");
			var candidate = new RTCIceCandidate(msg.content);
			this.pc.addIceCandidate(candidate);
		}
		else if (msg.type == "description")
		{
			//
			//console.log("description");
			var description = msg.content;
			
			if (msg.state == "offer")
			{
				this.pc.setRemoteDescription(new RTCSessionDescription(description));
				this.startAnswer();
			}
			else
			{
				this.pc.setRemoteDescription(new RTCSessionDescription(description));
			}

		}
		else if (msg.type == "message")
		{
			//
			addMessage(msg.content, this.avatar, this.id);
		}
		else if (msg.type == "nickname")
		{
			
		}
		else if (msg.type == "avatar")
		{
			this.avatar = document.createElement("img");
			this.avatar.src = msg.content;
			//
			//console.log("avatar");
			//
			//addMessage("join room", this.avatar);
		}
	}
	
	
	this.showMessage = function(message)
	{
		var temp = document.createElement("div");
		var avatar = document.createElement("div");
		var text = document.createElement("div");
		var content = document.createTextNode(message);
		var break_ = document.createElement("br");
		//
		temp.appendChild(avatar);
		temp.appendChild(text);
		temp.appendChild(break_);
		//
		avatar.appendChild(this.avatar.cloneNode(false));
		text.appendChild(content);
		avatar.style.float = "left";
		text.style.marginLeft = "80px";
		text.style.paddingTop = "10px";
		//
		chatMessages.appendChild(temp);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
	
	this.iamoffer = function()
	{
		var myid = this.id;
		console.log("iamoffer");
		var offerInterval = setInterval(function()
		{
			var temp = peerManager.getPeerById(myid);
			if (!temp || temp.startcall)
			{
				clearInterval(offerInterval);
			}
			else
			{
				temp.sendMessage({type: "offer"});
				console.log("reoffer");
			}
		}, 2000);
	}
	
	this.pc.onaddstream = this.gotStream;
	this.pc.onicecandidate = this.gotIceCandidate;
	this.pc.onsignalingstatechange = this.gotStateChange;
}

function PeerManager()
{
	this.peers = [];
	this.addPeer =  function (id)
	{
		var temp = new Peer(id)
		this.peers[this.peers.length] = temp;
		// call this
		if (this.peers.length > 9) 
		{
			channel.reject(id);
		}
		//
		if (id > channel.userid)
		{
			console.log("offer");
			temp.sendMessage({type: "offer"});
			temp.iamoffer();
		}
	}
	
	this.removePeer =  function(id)
	{
		removeVideo(id);
		// 
		index = this.getPeerIndexById(id);
		if (index != -1)
		{
			delete this.peers[index];
			this.peers.splice(index, 1);
		}
	}
	
	this.onMessage =  function(message, id)
	{
		index = this.getPeerIndexById(id);
		if (index != -1)
		{
			// process message
			this.peers[index].gotMessage(message);
		}
	}
	
	this.sendMessage = function(message, id)
	{
		if (id == null)
		{
			channel.send(message);
		}
		else 
		{
			index = this.getPeerIndexById(id);
			if (index != -1)
			{
				// process message
				this.peers[index].sendMessage(message);
			}
		}
	}
	
	this.getPeerIndexById = function(id)
	{
		for (i = 0; i < this.peers.length; ++i)
		{
			if (this.peers[i].id == id) return i;
		}
		
		return -1;
	}
	
	this.getPeerById = function(id)
	{
		for (i = 0; i < this.peers.length; ++i)
		{
			if (this.peers[i].id == id) return this.peers[i];
		}
		
		return null;
	}
	
	this.getPeerIndexByPC = function(pc)
	{
		for (i = 0; i < this.peers.length; ++i)
		{
			if (this.peers[i].pc == pc) return i;
		}
		
		return -1;
	}
}


function showMessage(message, avt)
{
	var temp = document.createElement("div");
	var avatar_ = document.createElement("div");
	var text = document.createElement("div");
	var content = document.createTextNode(message);
	var break_ = document.createElement("br");
	//
	temp.appendChild(avatar_);
	temp.appendChild(text);
	temp.appendChild(break_);
	//
	avatar_.appendChild(avt.cloneNode(false));
	text.appendChild(content);
	avatar_.style.float = "left";
	text.style.marginLeft = "80px";
	text.style.paddingTop = "10px";
	text.style.maxWidth = "190px";
	text.style.wordBreak = "break-all";
	//
	chatMessages.appendChild(temp);
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Element listenner
/* inputMessage.onkeypress = function(e)
{
	if (e.keyCode != 13) return;
	//
	var text = inputMessage.value;
	inputMessage.value = "";
	peerManager.sendMessage(JSON.stringify({type: "message", content: text}), null);
	//
	//showMessage(text, avatar);
} */

// Channel listenner
channel.onopen = function (userid) 
{
	isConnected = true;
    console.log(userid + " : connected");
	// call this one
	peerManager.addPeer(userid);
};

channel.onmessage = function (message, userid) {
    peerManager.onMessage(message, userid);
};

channel.onleave = function (userid) {
    console.log(userid + " : leave");
	peerManager.removePeer(userid);
};

channel.onclose = function (event)
{
	isConnected = false;
	channel.open(); 
	console.log("channel.open");

}

channel.ondatachannel = function(data_channel) {
    channel.join(data_channel);

    // or
	console.log("ondatachannel");
    // id:    unique identifier for the session
    // owner: unique identifier for the session initiator
};

// Start code
function starty()
{
	if (!roomId) return;
	// Init DataChannel room 
	// try to open channel
	channel.start(); 
}

// Connect to user media
function startx()
{
	if (!roomId) return; 
	if (localStream) return;
	navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({video:true, audio: true}, gotLocalStream,
    function(error) {
		console.log("getUserMedia error: ", error);
    });
}

function gotLocalStream(stream)
{
	localStream = stream;
	addVideo(stream, null);
	//
	starty();
}


// Process Video

function removeVideo(id)
{
	var element = document.getElementById(id);
	if (element) element.parentNode.removeChild(element);
	//
	arrangeVideo();
}

function CaptureImage() {
    var canvas = document.createElement("canvas");
	var video = document.getElementsByClassName("LocalVideo")[0];
	canvas.width = 60;
	canvas.height = video.videoHeight * 60 / video.videoWidth; 
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
 
    var img = document.createElement("img");
    img.src = canvas.toDataURL();
	return img
};


var callInterval = setInterval(function() 
{
	if (localStream != null && callanswerList.length != 0 && currentPeer == null)
	{
		console.log("/////////////////////////");
		//clearInterval(callInterval);
		entry = callanswerList[0];
		callanswerList.splice(0, 1);
		//
		if (entry.type == "call")
		{
			console.log("Call --->", entry.peer.id);
			currentPeer = entry.peer;
			currentPeer.pc.createOffer(currentPeer.gotOfferDescription);
		}
		else if (entry.type == "answer")
		{
			console.log("Answer --->", entry.peer.id);
			currentPeer = entry.peer;
			currentPeer.pc.createAnswer(currentPeer.gotAnswerDescription);
		}
	}
}, 2000);

window.onbeforeunload = function (e) {
	console.log("lav");
    channel.leave();
	//var message = 'Did you remember to download your form?';
	//e.returnValue = message;
    //return message;

};


//console.log("uncomment start()");
startx();
