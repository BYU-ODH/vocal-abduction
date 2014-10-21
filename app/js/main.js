requirejs.config({
  baseUrl: 'js'
});

require(['Game'], function(Game) {
  var player = new VowelWorm.instance(document.getElementById("poem"));
  var game = new Game({
    width: document.body.getBoundingClientRect().width,
    worms: player,
    element: document.getElementById("board"),
    spritePath: "assets/sprites/small/",
    consoleGraphicsPath: "assets/sprites/",
    consoleElement: document.getElementById('console'),
    lang: 'eng'
  });
});
