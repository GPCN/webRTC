var pubnub = PUBNUB.init({
publish_key: 'pub-c-97223e80-568d-4ee9-8bf7-b8f04d5767be',
subscribe_key: 'sub-c-315bcd98-16d4-11e4-81b7-02ee2ddab7fe'
});


var id = "";
var isServer = false;
var secret = "";
var peer = "";
var mutex = true;
//
function sendMessage(message)
{
	var msgString = JSON.stringify(message);
	pubnub.publish({
		channel: peer,
		message: msgString
	});
}

function unsubcriteChannel(channel)
{
	pubnub.unsubcribe({channel: channel});
}

//
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

var idParam = getURLParameter("id");
if (idParam == null)
{
	var d = new Date();
	window.location = window.location + "?id=" + d.getTime() + "&is=true";
}
else
{
	var isParam = getURLParameter("is");
	if (isParam == "true")
	{
		isServer = true;
	}
	
	var d = new Date();
	secret = d.getTime();
}

function gotPublicConnect(message)
{
	console.log("Message : " + message);
}
//
pubnub.subscribe({
channel: id,
callback: gotPublicPubMessage,
connect: gotPublicConnect
});