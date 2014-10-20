var chatOutput = document.getElementById('chat-output');
var chatInput = document.getElementById('chat-input');
chatInput.onkeypress = function (e) {
    if (e.keyCode != 13) return;
    channel.send(this.value);
    chatOutput.innerHTML = 'Me: ' + this.value + '<hr />' + chatOutput.innerHTML;
    this.value = '';
};

var channel = new DataChannel();

channel.onopen = function (userid) {
    chatInput.disabled = false;
    chatInput.value = 'Hi, ' + userid;
    chatInput.focus();
	console.log(userid, channel);
};

channel.onmessage = function (message, userid) {
    chatOutput.innerHTML = userid + ': ' + message + '<hr />' + chatOutput.innerHTML;
};

channel.onleave = function (userid) {
    chatOutput.innerHTML = userid + ' Left.<hr />' + chatOutput.innerHTML;
};

// search for existing data channels
channel.connect();

document.querySelector('button#setup-datachannel').onclick = function () {
    // setup new data channel

    channel.open("lav");
};

