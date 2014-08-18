(function(){console.log("Start JS")})();

(function(){
  var mediaOptions = {
	  video: {
		mandatory: {
		  minWidth: 12,
		  minHeight: 12
		}
	  },
	  audio: false
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
	//
	var video1 = document.querySelector("#player1");
    video1.src = window.URL.createObjectURL(stream);
	//
	video.onloadedmetadata = function(e) {
		// Ready to go. Do some stuff.
		console.log("I'm ready!");
    }; 
	
	video.addEventListener(
    'click', changeFilter, false);
  }
  
})();


var idx = 0;
var filters = ['grayscale', 'sepia', 'blur'];

function changeFilter(e) {

	
  var el = e.target;
  el.className = '';
  var effect = filters[idx++ % filters.length]; // loop through filters.
  if (effect) {
    el.classList.add(effect);
	console.log("click" + effect);
  }
}

