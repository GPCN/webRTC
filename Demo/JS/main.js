/*
var ua = new SIP.UA();


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


var session = ua.invite('102@192.168.7.177', options);
session.on('accepted', function () {
	
});
*/
	 

/* (function () {
    var session;
    //user agent configuration
    var configuration = {
        wsServers: 'ws://192.168.7.177:8088/ws',
        uri: '103@192.168.7.177',
        authorizationUser: '103',
        password: '103',
        displayName: '103',		
    };

    var userAgent = new SIP.UA(configuration);
	userAgent.register();
	userAgent.on('registered', function () {
       console.log('============================================');
    });
	
	userAgent.on('registrationFailed', function (cause) {console.log(cause)})

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
})();
 */
 
             var readyCallback = function(e){
                createSipStack(); // see next section
            };
            var errorCallback = function(e){
                console.error('Failed to initialize the engine: ' + e.message);
            }
            SIPml.init(readyCallback, errorCallback);
			
			//
			var registerSession;
			//
			 var sipStack;
            function eventsListener(e){
                if(e.type == 'started'){
                    //login();
					registerSession = sipStack.newSession('register', {
                    events_listener: { events: '*', listener: eventsListener } // optional: '*' means all events
					});
					registerSession.register();
                }
                else if(e.type == 'i_new_message'){ // incoming new SIP MESSAGE (SMS-like)
                    acceptMessage(e);
                }
                else if(e.type == 'i_new_call'){ // incoming audio/video call
                    acceptCall(e);
                }
				else if(e.type == 'connected' && e.session == registerSession){
					console.log("lav")
                }
            }
			
			 var acceptCall = function(e){
                e.newSession.accept(); // e.newSession.reject() to reject the call
            }
            
            function createSipStack(){
                sipStack = new SIPml.Stack({
                        realm: '192.168.247.129', // mandatory: domain name
                        impi: '1060', // mandatory: authorization name (IMS Private Identity)
                        impu: 'sip:1066@192.168.247.129', // mandatory: valid SIP Uri (IMS Public Identity)
                        password: '1060', // optional
                        display_name: '1060', // optional
                        websocket_proxy_url: 'ws://192.168.247.129:8088/ws', // optional
						outbound_proxy_url: 'udp://192.168.247.129:5060', // optional
                        enable_rtcweb_breaker: false, // optional
                        events_listener: { events: '*', listener: eventsListener }, // optional: '*' means all events
                        sip_headers: [ // optional
                                { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
                                { name: 'Organization', value: 'Doubango Telecom' }
                        ]
                    }
                );
            }
            sipStack.start();