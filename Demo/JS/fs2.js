var config = {
  // Replace this IP address with your FreeSWITCH IP address
  uri: '1004@192.168.7.177',
  
  // Replace this IP address with your FreeSWITCH IP address
  // and replace the port with your FreeSWITCH port
  ws_servers: 'ws://192.168.7.177:5066',
  
  // FreeSWITCH Default Username
  authorizationUser: '1004',
  
  // FreeSWITCH Default Password
  password: 'abcccbba',
  register: true
};

var ua = new SIP.UA(config);
ua.on('registered', function () {
	console.log("registered");
	ua.invite('1002@192.168.7.177',{
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
