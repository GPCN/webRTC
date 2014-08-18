function output(message)
{
	console.log(message);
}


output("Start JS");

var cfg = {"iceServers":[{"url": "stun:stun.l.google.com:19302"}]},
    con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };
	
var localPeerConnection;
var remotePeerConnection;
var localDataChannel;
var remoteDataChannel;
//
var localMessage = document.getElementById("localMessage");
var remoteMessage = document.getElementById("remoteMessage");
var localInput = document.getElementById("localInput");
var remoteInput = document.getElementById("remoteInput");
var localSend = document.getElementById("localSend");
var remoteSend = document.getElementById("remoteSend");
localSend.addEventListener("click", onLocalSend);
remoteSend.addEventListener("click", onRemoteSend);

function onLocalSend() 
{ 
	//output(localInput.value);
	localDataChannel.send(localInput.value + "\r\n");
}

function onRemoteSend() 
{ 
	//output(remoteInput.value);
	remoteDataChannel.send(remoteInput.value + "\r\n");
}

function gotLocalMessage(event)
{
	localMessage.value += event.data;
}

function gotRemoteMessage(event)
{
	remoteMessage.value += event.data;
}

function startCall()
{
    // Reliable Data Channels not yet supported in Chrome
	localPeerConnection = new webkitRTCPeerConnection(cfg, con);
	localPeerConnection.onicecandidate = gotLocalIceCandidate;
	localPeerConnection.ondatachannel = gotLocalDataChannel;
	//
    localDataChannel = localPeerConnection.createDataChannel("localDataChannel", {reliable: false});
	localDataChannel.onopen = gotLocalChannelStateChange;
	localDataChannel.onclose = gotLocalChannelStateChange;
	localDataChannel.onmessage = gotLocalMessage;
	
	//
	remotePeerConnection = new webkitRTCPeerConnection(cfg, con);
	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	remotePeerConnection.ondatachannel = gotRemoteDataChannel;
	
	// create offer
	localPeerConnection.createOffer(gotLocalDescription);
}


function gotLocalDataChannel(event)
{	
	//localDataChannel = event.channel;
	//localDataChannel.onmessage = gotLocalMessage;
	//localDataChannel.onopen = gotLocalChannelStateChange;
	//localDataChannel.onclose = gotLocalChannelStateChange;
}

function gotRemoteDataChannel(event)
{	
	output("gotRemoteDataChannel");
	remoteDataChannel = event.channel;
	remoteDataChannel.onmessage = gotRemoteMessage;
	remoteDataChannel.onopen = gotRemoteChannelStateChange;
	remoteDataChannel.onclose = gotRemoteChannelStateChange;
}

function gotLocalIceCandidate(event)
{
	if (event.candidate)
	{
		remotePeerConnection.addIceCandidate(event.candidate);
	}
}

function gotRemoteIceCandidate(event)
{
	if (event.candidate)
	{
		localPeerConnection.addIceCandidate(event.candidate);
	}
}

function gotLocalDescription(description)
{
	localPeerConnection.setLocalDescription(description);
	remotePeerConnection.setRemoteDescription(description);
	remotePeerConnection.createAnswer(gotRemoteDescription);
}

function gotRemoteDescription(description)
{
	remotePeerConnection.setLocalDescription(description);
	localPeerConnection.setRemoteDescription(description);
}

function gotLocalChannelStateChange()
{
	
}

function gotRemoteChannelStateChange()
{
	
}

(function(){
	startCall();
})();