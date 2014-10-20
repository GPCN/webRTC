console.log("Start Demo");

// 
// message {type,content}

// Vars
var channel = new DataChannel();
var isHasRoom = true;
var isConnected = false;
var peerManager = new PeerManager();
var createRoom = document.getElementById("createRoom");
var videosContainer = document.getElementById("videos");
var peerConnection = null;
var localStream = null;
var currentPeer = null;
var callanswerList = [];
var inputMessage = document.getElementById("inputMessage");
var chatWrapper = document.getElementById("chatWrapper");
var chatMessages = document.getElementById("chatMessages");
var avatar = null;

// Check room

var roomId = getURLParameter("room");
if (roomId != null)
{
	createRoom.style.display = 'none';
}
else
{
	// document.URL = document.URL + "?room="
	isHasRoom = false;
}

chatWrapper.style.display = "none";


// Classes
function Peer(id) {
    this.id = id;
	this.nickname = "";
	this.avatar = null;
    this.pc = new webkitRTCPeerConnection(null);
	this.pc.addStream(localStream);
	//
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
		//console.log("Got Description", this);
		currentPeer.pc.setLocalDescription(des);
		currentPeer.sendMessage({type:"description", content: des, state: "offer"});
		currentPeer = null;
	}
	

	
	this.gotAnswerDescription = function(des)
	{
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
		callanswerList[callanswerList.length] = {type:"answer", peer : this};
	}
	
	this.gotMessage = function(message)
	{
		// process message
		var msg = JSON.parse(message);
		//
		if (msg.id && msg.id != channel.userid) return;
		//
		//console.log("gotMessage", message);
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
			showMessage(msg.content, this.avatar);
		}
		else if (msg.type == "nickname")
		{
			
		}
		else if (msg.type == "avatar")
		{
			this.avatar = document.createElement("img");
			this.avatar.src = msg.content;
			//
			console.log("avatar");
			//
			this.showMessage("join room");
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
			temp.sendMessage({type: "offer"});
		}
	}
	
	this.removePeer =  function(id)
	{
		removeVideo(id);
		// 
		index = this.getPeerIndexById(id);
		console.log("removePeer", index);
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
inputMessage.onkeypress = function(e)
{
	if (e.keyCode != 13) return;
	//
	var text = inputMessage.value;
	inputMessage.value = "";
	peerManager.sendMessage(JSON.stringify({type: "message", content: text}), null);
	//
	showMessage(text, avatar);
}

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


// Start code
if (isHasRoom)
{
	// Init DataChannel room 
	// try to open channel
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState == "complete" && localStream) {
			if (!isConnected) 
			{
				channel.open(); 
			}
			clearInterval(readyStateCheckInterval);
		}
	}, 4000);
	
	var readyStateCheckInterval2 = setInterval(function() {
		if (document.readyState == "complete" && localStream) {
			if (!isConnected) 
			{
				channel.connect();
			}
			clearInterval(readyStateCheckInterval2);
		}
	}, 500);
}

// Connect to user media
function start()
{
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
	chatWrapper.style.display = "inline";
	//
	var captureImageInterval = setInterval(function() {
		avatar = CaptureImage();
		clearInterval(captureImageInterval);
	}, 2000);
}


// Process Video
function addVideo(stream, id)
{
	// console.log("Stream", stream);
	// create a div element
	var temp = document.createElement("div");
	var tempVideo = document.createElement("video");
	var tempBar = document.createElement("div");
	//
	
	//
	if (id == null)
	{
		temp.id = channel.userid;
		temp.setAttribute("type", "local");
		temp.setAttribute("class", "LocalVideoContainer");
		tempVideo.setAttribute("class", "LocalVideo");
		tempVideo.setAttribute("muted","");
		tempBar.setAttribute("class", "LocalBar");
	}
	else
	{
		temp.id = id;
		temp.setAttribute("type", "remote");
		temp.setAttribute("class", "RemoteVideoContainer");
		tempVideo.setAttribute("class", "RemoteVideo");
		tempVideo.setAttribute("muted","");
		tempBar.setAttribute("class", "RemoteBar");
	}
	
	// toolbar
	temp.appendChild(tempVideo);
	temp.appendChild(tempBar);
	
	// setVideo
	tempVideo.src = URL.createObjectURL(stream);
	tempVideo.autoplay = true;
	//
	videosContainer.appendChild(temp);
}


function removeVideo(id)
{
	var element = document.getElementById(id);
	element.parentNode.removeChild(element);
}

function arrangeVideo()
{
	
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
  e = e || window.event;
  // For IE and Firefox
  if (e) {
    channel.leave();
  }
};

window.onload = addListeners;

function addListeners(){
    document.getElementById('dxy').addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

}

function mouseUp()
{
    window.removeEventListener('mousemove', divMove, true);
}

function mouseDown(e){
  window.addEventListener('mousemove', divMove, true);
}

function divMove(e){
    var div = document.getElementById('dxy');
  div.style.position = 'absolute';
  div.style.top = e.clientY + 'px';
  div.style.left = e.clientX + 'px';
}​

//console.log("uncomment start()");
start();
