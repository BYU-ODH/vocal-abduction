define(['Saucer', 'Beam', 'Console', 'Marker'], function(Saucer, Beam, Console, Marker) {
  /**
   * @param {Object=} options Configuration options
   * @param {VowelWorm.instance|Array.<VowelWorm.instance>} options.worms Any
   * VowelWorm instances to begin with
   * @param {number=} [options.width=700] The width of the game board
   * @param {number=} [options.height=500] The height of the game board
   * @param {number=} [options.background=0xFFFFFF] The background color of the game
   * @param {HTMLElement=} [options.element=document.body] What to append the graph to
   * @param {string=} [options.lang=eng] The three-letter language code for the game
   * @param {HTMLElement=} options.consoleElement The element to put the console into
   * @param {string=} options.spritePath The path to the image assets
   * @param {string=} options.consoleGraphicsPath The path to the console.svg file
   * @param {string=} options.audioPath The path to the audio assets
   * @constructor
   * @name Game
   */
  return function Game( options ) {
    "use strict";

    var game     = this,
        _console = new Console(options.lang || 'eng', options.consoleGraphicsPath),
        _beam = null,
        _marker = null;

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
    var GRAPHICS_PATH = options.spritePath || "";

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
    var SPRITE_SHEET = new PIXI.SpriteSheetLoader(GRAPHICS_PATH + 'sheet.json');

    // after the sprites and console have loaded, we just might be ready
    // TODO: destroy callback hell
    SPRITE_SHEET.addEventListener('loaded', function(){
      options.consoleElement.appendChild(_console.element);
      _console.addEventListener('ready', function() {
        _init();
        ready = true;
      });
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
        if(!_console.sound) {
          _console.loadWord();
          _console.startTimer();
          
          _marker = new Marker(_console.sound);
          game._stage.addChild(_marker);

          var coords = adjustXAndY(_marker.vowel_backness, _marker.vowel_height);
          _marker.x = coords.x;
          _marker.y = coords.y;
        }
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
      container.saucer = new Saucer();
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

    // CREATE GAME
    function _init() {
      var bgColor = options.background !== undefined ? options.background : 0xFFFFFF;
      game._stage = new PIXI.Stage(bgColor);
      game._renderer = PIXI.autoDetectRenderer(game.width, game.height, null, true);
      try{
        options.element.appendChild(game._renderer.view);
      }catch(e){
        document.body.appendChild(game._renderer.view);
      }
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
      };
      _beam = new Beam();
      _beam.x = options.width - _beam.width;
      _beam.y = 0;

      game._stage.addChild(_beam);

      game._renderer.render(game._stage);

      _beam.addEventListener('abduct', function(){
        _console.loadWord();

        game._stage.removeChild(_marker);

        _marker = new Marker(_console.sound);
        game._stage.addChild(_marker);

        var coords = adjustXAndY(_marker.vowel_backness, _marker.vowel_height);
        _marker.x = coords.x;
        _marker.y = coords.y;
      });
      game.play();
    };
  };
});
