requirejs.config({
  baseUrl: 'js'
});

require(['Game'], function(Game) {
  var player = new VowelWorm.instance(document.getElementById("poem"));
  var game = new Game({
    worms: player,
    element: document.getElementById("board"),
    graphicsPath: "assets/sprites/small"
  });
  game.on('load', function() {
    var loading = document.getElementById('loading');
    var readybtn = document.getElementById('readybtn');
    var progressbar = document.getElementById('progressbar');

    loading.classList.add('ready');
    readybtn.addEventListener('click', function() {
      document.body.removeChild(loading);
    });
  });
});
