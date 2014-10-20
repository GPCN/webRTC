
(function(){console.log("Start JS")})();

(function(){
  var mediaOptions = {
	  video: {
		mandatory: {
		  minWidth: 1200,
		  minHeight: 1200
		}
	  }
	};
 
  if (!navigator.getUserMedia) {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }
 
  if (!navigator.getUserMedia){
    return alert('getUserMedia not supported in this browser.');
  }
 
  navigator.getUserMedia(mediaOptions, success, function(e) {
    console.log(e);
  });
  
 
  function success(stream){
    console.log(window.URL.createObjectURL(stream));
    var video = document.querySelector("#player");
    video.src = window.URL.createObjectURL(stream);
	video.onloadedmetadata = function(e) {
		// Ready to go. Do some stuff.
		console.log("I'm ready!");
    };
  }
})();