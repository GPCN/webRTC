// main.js
(function () {
    var session;
    //user agent configuration
    var configuration = {
        wsServers: 'ws://192.168.7.177:8088/ws',
        uri: "1063@192.168.7.177",
        authorizationUser: "1063",
        password: "1063",
        displayName: "1063",
		hackIpInContact: true,
		register: true
    };

    var userAgent = new SIP.UA(configuration);
	//userAgent.start();

    userAgent.on('invite', function (incomingSession) {
        session = incomingSession;
        session.accept({
            media: {
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
	
	userAgent.on('registered', function () {
		console.log("registered");
	});
})();