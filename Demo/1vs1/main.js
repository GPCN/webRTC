var pubnub = PUBNUB.init({
publish_key: 'pub-c-97223e80-568d-4ee9-8bf7-b8f04d5767be',
subscribe_key: 'sub-c-315bcd98-16d4-11e4-81b7-02ee2ddab7fe'
});

var id = ""
var secret = ""
var peer = ""
var isconnected = false;
var pc = null;
var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
var localStream = null;
// 
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}
var idParam = getURLParameter("id");
if (idParam == null)
{
	var d = new Date();
	window.location = window.location + "?id=" + d.getTime();
}
else
{
	var d = new Date();
	id = idParam;
	secret = d.getTime();
	
	console.log("Have id : " + id);
	console.log("Have secret : " + secret);
}

function gotPubMessage(message)
{
	
	// process message
	var msg = JSON.parse(message);
	//
	//console.log("Receive : " + message);
	//
	if (msg.type == "offer")
	{
		// bat dau khoi tao cuoc goi
		console.log("process offer");
		isconnected = true;
		sendMessage({type: "call"});
		startCallee();
	}
	else if (msg.type == "call")
	{
		console.log("process call");
		isconnected = true;
		startCall();
	}
	else if (msg.type == "candidate")
	{
		//console.log("Candidate : " + message);
		// 
		var candidate = new RTCIceCandidate(JSON.parse(msg.candidate));
		pc.addIceCandidate(candidate);
	}
	else if (msg.type == "description")
	{
		//console.log("Description : " + message);
		var description = JSON.parse(msg.description);
		pc.setRemoteDescription(new RTCSessionDescription(description));
		
		if (msg.state == "offer")
		{
			console.log("createAnswer");
			// Create answer
			pc.createAnswer(gotAnswerDescription);
		}
	}
}

function startCallee()
{
	//isconnected = true;
	//
	pc = new webkitRTCPeerConnection(null);
	pc.onaddstream = gotRemoteStream;
	pc.onicecandidate = gotbCandidate;
	pc.onopen = gotOpenConnection;
	//
	if (localStream != null)
	{
		console.log("addStream");
		pc.addStream(localStream);
	}
}

function startCall()
{
	pc = new webkitRTCPeerConnection(null);
	pc.onaddstream = gotRemoteStream;
	pc.onicecandidate = gotaCandidate;
	pc.onopen = gotOpenConnection;
	
	// createOffer
	if (localStream != null)
	{
		console.log("addStream");
		pc.addStream(localStream);
	}
	pc.createOffer(gotOfferDescription);
}


function gotOpenConnection()
{
	
}

function gotaCandidate(event)
{
	console.log("gotaCandidate");
	// send candidate
	if (event.candidate)
	{
		sendMessage({type: "candidate", candidate: JSON.stringify(event.candidate), secret: secret});
	}
}


function gotbCandidate(event)
{
	console.log("gotbCandidate");
	// send candidate
	if (event.candidate)
	{
		sendMessage({type: "candidate", candidate: JSON.stringify(event.candidate), secret: secret});
	}
}

function gotOfferDescription(description)
{
	console.log("gotOfferDescription");
	pc.setLocalDescription(description);
	// send descriptoin
	sendMessage({type: "description", state: "offer", description: JSON.stringify(description), secret: secret});
}

function gotAnswerDescription(description)
{
	pc.setLocalDescription(description);
	// send descriptoin
	sendMessage({type: "description", status: "answer", description: JSON.stringify(description), secret: secret});
}

function gotPublicPubMessage(message)
{
	//
	if (message != secret && message != peer)
	{
		isconnected = true;
		peer = message;
		console.log("gotConnected");
		//
		pubnub.publish({
			channel: id,
			message: secret
		});
		
		//
		if (parseInt(secret) > parseInt(message))
		{
			//console.log("winner");
			sendMessage({type: "offer", secret: secret});
		}
	}
}

function gotPublicConnect()
{
	if (!isconnected)
	{
		pubnub.publish({
			channel: id,
			message: secret
		});
		
		setTimeout(gotPublicConnect, 2000);
	}
	
}

function gotConnect()
{

}

pubnub.subscribe({
channel: id,
callback: gotPublicPubMessage,
connect: gotPublicConnect
});

pubnub.subscribe({
channel: secret,
callback: gotPubMessage,
connect: gotConnect
});


// Connect to user media
function start()
{
	navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({video:true}, gotStream,
    function(error) {
      console.log("navigator.getUserMedia error: ", error);
    });
}

function gotStream(stream)
{
	clientVideo.src = URL.createObjectURL(stream);
	localStream = stream
}


function gotRemoteStream(event)
{
	console.log("got remote stream");
	peerVideo.src = URL.createObjectURL(event.stream);
}

function sendMessage(message)
{
	var msgString = JSON.stringify(message);
	pubnub.publish({
		channel: peer,
		message: msgString
	});
	
	//console.log("send==============");
}

start();

// send offer message
function tryToOffer()
{
	//console.log("tryToOffer");
	if (!isconnected)
	{
		sendMessage({type: "offer", secret: secret});
		setTimeout(tryToOffer, 2000);
		
		
	}
}

