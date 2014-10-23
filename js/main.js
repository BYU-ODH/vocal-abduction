requirejs.config({
  baseUrl: 'js'
});

/**
 * Polyfill for getUserMedia
 */
function getUserMedia() {
  (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia
          || function(){alert('getUserMedia missing')}).apply(navigator, arguments);
}

require(['Game'], function(Game) {
  var game = new Game({
    width: document.body.getBoundingClientRect().width,
    element: document.getElementById("board"),
    graphicsPath: "assets/sprites/small/",
    consoleGraphicsPath: "assets/sprites/",
    consoleElement: document.getElementById('console'),
    lang: 'eng'
  });
  game.on('load', function() {
    var loading = document.getElementById('loading');
    var readybtn = document.getElementById('readybtn');
    var progressbar = document.getElementById('progressbar');

    loading.classList.add('ready');
    readybtn.addEventListener('click', function() {
      getUserMedia({audio: true}, function sucess(stream) {
        var worm = new window.VowelWorm.instance(stream);
        game.addWorm(worm);

        document.body.removeChild(loading);
        game.play();
      }, function failure() {
        alert("There was an error retrieving microphone input.");
      });
    });
  });
});
