
(function(){console.log("Start JS")})();

window.AudioContext = window.AudioContext ||
                      window.webkitAudioContext;

var context = new AudioContext();

var errorCallback = function(e) {
    console.log('Reeeejected!', e);
  };

  if (!navigator.getUserMedia) {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }
  
navigator.getUserMedia({audio: true}, function(stream) {
  var microphone = context.createMediaStreamSource(stream);
  var filter = context.createBiquadFilter();

  // microphone -> filter -> destination.
  microphone.connect(filter);
  filter.connect(context.destination);
}, errorCallback);