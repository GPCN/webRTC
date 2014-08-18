var pubnub = PUBNUB.init({
publish_key: 'pub-c-97223e80-568d-4ee9-8bf7-b8f04d5767be',
subscribe_key: 'sub-c-315bcd98-16d4-11e4-81b7-02ee2ddab7fe'
});

var d = new Date();
console.log(d.getTime());


function gotMessage(message)
{
	console.log(message);
}

pubnub.subscribe({
channel: "ptChannel",
callback: gotMessage,
connect: function () {
pubnub.publish({
channel: "ptChannel",
message: d.getTime()
});
}
});