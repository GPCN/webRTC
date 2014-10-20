

var config = {
  // Replace this IP address with your Asterisk IP address
  uri: '1060@192.168.7.177',

  // Replace this IP address with your Asterisk IP address,
  // and replace the port with your Asterisk port from the http.conf file
  wsServers : 'ws://192.168.7.177:8088/ws',

  // Replace this with the username from your sip.conf file
  authorizationUser: '1060',

  // Replace this with the password from your sip.conf file
  password: '1060',
  
  // HackIpInContact for Asterisk
  hackIpInContact: true,
  
  register: true
};

var ua = new SIP.UA(config);
ua.on('registered', function () {
	console.log("registered");
	ua.invite('1063@192.168.7.177',{
	media: {
            constraints: {
                audio: true,
                video: false
            },
			render: {
                remote: {
                    video: document.getElementById('remoteVideo')
                },
                local: {
                    video: document.getElementById('localVideo')
                }
            }
	}
	});
});

//ua.start();
ua.on('unregistered', function (cause) {console.log("unregistered", cause)});
ua.on('registrationFailed', function (cause) {console.log("registrationFailed", cause)});
// Invite with audio only
//ua.register();
//
var endButton = document.getElementById('endCall');
endButton.addEventListener("click", function () {
        ua.bye();
        alert("Call Ended");
 }, false);



/*
// main.js
(function () {
    var session;

    var endButton = document.getElementById('endCall');
    endButton.addEventListener("click", function () {
        session.bye();
        alert("Call Ended");
    }, false);
	
	//
	var config = {
  // Replace this IP address with your Asterisk IP address
  uri: '1060@192.168.7.177',

  // Replace this IP address with your Asterisk IP address,
  // and replace the port with your Asterisk port from the http.conf file
  ws_servers: 'ws://192.168.7.177:8088/ws',

  // Replace this with the username from your sip.conf file
  authorizationUser: '1060',

  // Replace this with the password from your sip.conf file
  password: '1060',
  
  // HackIpInContact for Asterisk
  hackIpInContact: true,
  DtlsSrtpKeyAgreement :true,
};

    //Creates the anonymous user agent so that you can make calls
    var userAgent = new SIP.UA(config);

    //here you determine whether the call has video and audio
    var options = {
        media: {
            constraints: {
                audio: true,
                video: true
            },
            render: {
                remote: {
                    video: document.getElementById('remoteVideo')
                },
                local: {
                    video: document.getElementById('localVideo')
                }
            }
        }
    };
    //makes the call
    session = userAgent.invite('1061', options);
})();
*/