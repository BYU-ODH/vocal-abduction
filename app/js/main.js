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
});
