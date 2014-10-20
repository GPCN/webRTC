var config = {
  // Replace this IP address with your FreeSWITCH IP address
  uri: '1002@192.168.7.177',
  
  // Replace this IP address with your FreeSWITCH IP address
  // and replace the port with your FreeSWITCH port
  ws_servers: 'ws://192.168.7.177:5066',
  
  // FreeSWITCH Default Username
  authorizationUser: '1002',
  
  // FreeSWITCH Default Password
  password: 'abcccbba',
  register: true
};

var ua = new SIP.UA(config);

ua.on('registered', function(){console.log("lav")});

ua.on('invite', function (incomingSession) {
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
	
//ua.start();