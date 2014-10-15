define(['Saucer', 'Beam'], function(Saucer, Beam) {
  /**
   * Events:
   *  load - when the game has loaded
   *
   * @param {Object=} options Configuration options
   * @param {VowelWorm.instance|Array.<VowelWorm.instance>} options.worms Any
   * VowelWorm instances to begin with
   * @param {number=} [options.width=700] The width of the game board
   * @param {number=} [options.height=500] The height of the game board
   * @param {number=} [options.background=0xFFFFFF] The background color of the game
   * @param {HTMLElement=} [options.element=document.body] What to append the graph to
   * @param {string=} options.graphicsPath The path to the image assets
   * @param {string=} options.audioPath The path to the audio assets
   * @constructor
   * @name Game
   */
  return function Game( options ) {
    "use strict";

    var game = this;
    PIXI.EventTarget.call(game); // so we can dispatch events

    game.width = options.width || 700;
    game.height = options.height || 500;
    game.x1 = -1;
    game.x2 = 2;
    game.y1 = -1;
    game.y2 = 3;
    
    game.minHz = 300;
    game.maxHz = 8000;
    game.fb = 10;

    /**
     * Represents the threshold in dB that VowelWorm's audio should be at in
     * order to to plot anything.
     * @see {@link isSilent}
     * @memberof VowelWorm.Game
     * @name silence
     * @type number
     */
    game.silence = -70;
   
    /**
     * Where the graphics for the game are found
     * @private
     * @const
     */
    var GRAPHICS_PATH = options.graphicsPath || "";
    
    /**
     * Where the audio files for the game are found
     * @private
     * @const
     */
    var AUDIO_PATH = options.audioPath || "";

    /**
     * whether or not the game is ready for play. @see SPRITE_SHEET and
     * other asset-loading items.
     * @private
     */
    var ready = false;

    /**
     * Contains the sprites for the game.
     * TODO: Determine the best size of sprites to use
     * @const
     * @private
     */
    var SPRITE_SHEET = new PIXI.SpriteSheetLoader(GRAPHICS_PATH + '/sheet.json');
    SPRITE_SHEET.addEventListener('loaded', function(){
      ready = true;
      game.emit({type: 'load'});
    });
    SPRITE_SHEET.load();

    /**
     * Contains all instances of worms for this game
     * @type Array.<Object>
     * @private
     */
    var worms = [];

    /**
     * You can change this with game.ipa = true/false
     * @type boolean
     * @memberof VowelWorm.Game
     * @name ipa
     */
    var ipaEnabled = true;
   
    var ipaChart = new PIXI.DisplayObjectContainer();  

    /**
     * Begins animation of worms
     * @memberof VowelWorm.Game
     * @name play
     */
    game.play = function(){
      if(ready) {
        game.drawWorm();
      }
      window.requestAnimationFrame(game.play);
    };

    /**
     * Inserts a worm into the ever-increasing frenzy of VowelWorm.
     * @param {window.VowelWorm.instance} worm
     * @memberof VowelWorm.Game
     * @name addWorm
     */
    game.addWorm = function(worm) {
      var container = {};
      container.worm = worm;
      worms.push(container);

      SPRITE_SHEET.addEventListener('loaded', function(){
        container.saucer = new Saucer();
        container.beam = new Beam();
        game._stage.addChild(container.beam);
        container.beam.x = 0;
        container.beam.y = 0;
      });
    };

    /**
     * @private
     */
    game.drawWorm = function(){
      var current_color = 0x00FF00;
      worms.forEach(function(container) {
        var worm = container.worm;
        var coords = getCoords(worm);

        if(!coords) {
          if(container.saucer && game._stage.children.indexOf(container.saucer) !== -1) {
            game._stage.removeChild(container.saucer);
          }
          return;
        }

        if(game._stage.children.indexOf(container.saucer) === -1) {
          game._stage.addChild(container.saucer);
        }

        container.saucer.position.x = coords.x;
        container.saucer.position.y = coords.y;
      });
      game._renderer.render(game._stage);
    };

    Object.defineProperties(game, {
      ipa: {
        enumerable: true,
        get: function() {
          return ipaEnabled;
        },
        set: function(val) {
          var bool = !!val;
          if(ipaEnabled === bool) {
            return;
          }
          ipaEnabled = bool;
          
          if(ipaEnabled) {
            game._stage.addChild(ipaChart);
          }
          else
          {
            game._stage.removeChild(ipaChart);
          }
          window.requestAnimationFrame(game._renderer.render);
        }
      }
    });
    
    var getCoords = function(worm){
      var buffer = worm.getFFT();

      if(isSilent(buffer)) {
        return null;
      }

      var position = worm.getMFCCs({
        minFreq: game.minHz,
        maxFreq: game.maxHz,
        filterBanks: game.fb,
        fft: buffer
      });
      
      if(position.length) {
        var x = position[1];
        var y = position[2];

        //Pass in coords flipped 90 degrees
        var coords = adjustXAndY(y,-x);
        return coords;
      }else{
        return null;
      }
    };
    
    var adjustXAndY = function(x,y){    
      var xStart = game.x1;
      var xEnd = game.x2;
      var yStart = game.y1;
      var yEnd = game.y2;

      var xDist = game.width/(xEnd-xStart);
      var yDist = game.height/(yEnd-yStart);

      var adjustedX = (x-xStart)*xDist;
      var adjustedY = game.height-(y-yStart)*yDist;
      
      return {x:adjustedX,y:adjustedY};
    };

    /**
     * Determines whether, for plotting purposes, the audio data is silent or not
     * Compares against the threshold given for {@link game.silence}.
     * @param {Array.<number>|Float32Array} data - An array containing dB values
     * @return {boolean} Whether or not the data is essentially 'silent'
     */
    var isSilent = function(data) {
      for(var i = 0; i<data.length; i++) {
        if(data[i] > game.silence) {
          return false;
        }
      }
      return true;
    };

    /**
     * Fills the IPA Chart. A constructor helper method.
     */
    var drawVowels = function() {
      if(!ipaChart.children.length) {
        var letters = [
          ["e",221.28871891963863,252.35519027188354],
          ["i",169.01833799969594,171.97765003235634],
          ["a",317.6219414250667,337.00896411883406],
          ["o",384.5714404194302,284.96641792056766],
          ["u",412.17314090483404,231.94657762575406]
        ];
        for(var i=0; i<letters.length; i++){
          var letter = new PIXI.Text(letters[i][0],{font: "35px sans-serif", fill: "black", align: "center"});
          letter.position.x = letters[i][1];
          letter.position.y = letters[i][2];
          ipaChart.addChild(letter);
        }
      }
    };

    // CREATE GAME
    var bgColor = options.background !== undefined ? options.background : 0xFFFFFF;
    game._stage = new PIXI.Stage(bgColor);
    game._renderer = PIXI.autoDetectRenderer(game.width, game.height);
    try{
      options.element.appendChild(game._renderer.view);
    }catch(e){
      document.body.appendChild(game._renderer.view);
    }
    drawVowels();
    if(ipaEnabled) {
      game._stage.addChild(ipaChart);
    }
    
    if(options.worms) {
      if(options.worms instanceof Array) {
        options.worms.forEach(function(worm) {
          game.addWorm(worm);
        });
      }
      else
      {
        game.addWorm(options.worms);
      }
    }
    game._renderer.render(game._stage);
    game.play();
  };
});
