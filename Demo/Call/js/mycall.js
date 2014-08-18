var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");
var localStream, localPeerConnection, remotePeerConnection;
var remoteCandidate, localCandidate;
var localDescription, remoteDescription;
//
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

//
function gotStream(stream)
{
	localVideo.src = URL.createObjectURL(stream);
	localStream = stream;
	callButton.disabled = false;
}
//
function start()
{
	console.log("request local stream");
	//
	startButton.disabled = true;
	navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({video:true}, gotStream,
    function(error) {
      trace("navigator.getUserMedia error: ", error);
    });
}


function call()
{
	console.log("call");
	callButton.disabled = true;
	hangupButton.disabled = false;
	//
	if (localStream.getAudioTracks().length > 0)
	{
		console.log("Audio : " + localStream.getAudioTracks()[0].label);
	}
	
	if (localStream.getVideoTracks().length > 0)
	{
		console.log("Video : " + localStream.getVideoTracks()[0].label);
	}
	
	//
	var servers = null;
	localPeerConnection = new webkitRTCPeerConnection(servers);
	localPeerConnection.onicecandidate = gotLocalCandidate;
	
	remotePeerConnection = new webkitRTCPeerConnection(servers);
	remotePeerConnection.onicecandidate = gotRemoteCandidate;
	remotePeerConnection.onaddstream = gotRemoteStream;
	
	// createOffer
	localPeerConnection.addStream(localStream);
	localPeerConnection.createOffer(gotLocalDescription);
	
}

function gotLocalCandidate(event)
{
	console.log("gotLocalCandidate");
	if (event.candidate)
	{
		// send event.candidate to remote
		localCandidate = event.candidate;
		console.log("Local candidate : " + JSON.stringify(event.candidate));
		remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	}
	else
	{
		console.log("gotLocalCandidate ===");
	}
}

function gotRemoteCandidate(event)
{
	if (event.candidate)
	{
		// send event.candidate to local
		remoteCandidate = event.candidate;
		console.log("Remote candidate : " + JSON.stringify(event.candidate));
		localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	}
}

function gotRemoteStream(event)
{
	remoteVideo.src = URL.createObjectURL(event.stream)
	remoteVideo.style.opacity = 1;
}

function gotLocalDescription(description)
{
	localDescription = description;
	console.log("Local description : ", description);
	localPeerConnection.setLocalDescription(description);
	//
	remotePeerConnection.setRemoteDescription(description);
	remotePeerConnection.createAnswer(gotRemoteDescription);
}

function gotRemoteDescription(description)
{
	remoteDescription = description;
	console.log("Remote description : ", description);
	remotePeerConnection.setLocalDescription(description);
	localPeerConnection.setRemoteDescription(description);
}

function hangup()
{
	console.log("hangup");
	localPeerConnection.close();
	remotePeerConnection.close();
	//
	localPeerConnection = null;
	remotePeerConnection = null;
	hangupButton.disabled = true;
	callButton.disabled = false;
	remoteVideo.style.opacity = 0;
}
//