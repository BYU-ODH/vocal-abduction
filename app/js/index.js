var player = new VowelWorm.instance(document.getElementById("poem"));
var game = new VowelWorm.Game({
  worms: player,
  element: document.getElementById("board"),
  graphicsPath: "assets"
});
