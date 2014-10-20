
(function() {
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;

var stream = null;
var button = document.querySelector('button');
var container = document.querySelector('#container');

if (!location.protocol.match('https')) {
  showErrorMsg('You may need to run this app from https.');
}
if (!(navigator.userAgent.match('Chrome') &&
      parseInt(navigator.userAgent.match(/Chrome\/(.*) /)[1]) >= 26)) {
  showErrorMsg('You need Chrome 26+ to run this demo properly.');
}

function showErrorMsg(msg) {
  var error = document.querySelector('#error');
  error.textContent = msg;
  error.classList.add('show');
}

function start(e) {
  // Seems to only work over SSL.
  navigator.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: 'screen'
        // maxWidth: 640,
        // maxHeight: 480
      }
    }
  }, function(s) {
    stream = s;

    button.textContent = 'Stop';
    button.removeEventListener('click', start);
    button.addEventListener('click', stop);

    var video = document.createElement('video');
    video.src = window.URL.createObjectURL(stream);
    video.autoplay = true;

    // var style = document.createElement('style');
    // style.textContent = document.querySelector('#embedstyles').textContent;
    // document.head.appendChild(style);

    stream.onended = function(e) {
      video.classList.add('fade');
    };

    //document.body.appendChild(video);
    container.innerHTML = '';
    container.appendChild(video);
  }, function(e) {
    if (e.code == e.PERMISSION_DENIED) {
      showErrorMsg('PERMISSION_DENIED. Are you no SSL? Have you enabled the --enable-usermedia-screen-capture flag?');
    }
  });
}

function stop() {
  stream.stop();
  button.addEventListener('click', start);
  button.textContent = 'Capture your screen';
}

button.addEventListener('click', start);

})();
