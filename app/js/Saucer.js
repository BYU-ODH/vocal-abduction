define(['Color'], function(Color) {
  /**
   * The Saucer that flies around the screen
   * @param {Object=} options Configuration options
   * @param {number=} [options.color] The color for the ship. @see Color
   * @constructor
   */
  function Saucer(options) {
    var _this = this,
        _sprite,
        /**
         * The color of the ship. @see Color
         * @name color
         * @memberof Saucer
         * @type number
         */
        _color,
        options = options || {};

    /**
     * Whether or not the tractor beam should be enabled
     * @type boolean
     * @memberof Saucer
     * @name beam
     */
    var _beam = false;

    PIXI.DisplayObjectContainer.call(_this);

    function setBeam(val) {
      if(val == _beam) {
        return;
      }
      _beam = Boolean(val);
      this.removeChild(_sprite);

      if(_beam) {
        _sprite = new PIXI.Sprite.fromFrame( _color + 'Circle.png');
      }
      else
      {
        _sprite = new PIXI.Sprite.fromFrame(_color + 'Circle.png')
      }

      _sprite.anchor.x = 0.5;
      _sprite.anchor.y = 0.5;
      this.addChild(_sprite);
    };

    function _init() {
      var color_count = Object.keys(Color).length;
      var key = Object.keys(Color)[Saucer._index % color_count];

      _color = options.color || Color[key];

      _sprite = new PIXI.Sprite.fromFrame(_color + 'Circle.png');
      _sprite.anchor.x = 0.5;
      _sprite.anchor.y = 0.5;

      _this.addChild(_sprite);

      Saucer._index++;
    };

    Object.defineProperties(_this, {
      beam: {
        enumerable: true,
        get: function() { return _beam; },
        set: setBeam
      },
      color: {
        enumerable: true,
        get: function() { return _color; }
      }
    });

    _init();
  };

  /**
   * Keeps track of how many saucers have been created (for colorization's sake)
   * @type number
   */
  Saucer._index = 0;
  Saucer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Saucer.prototype.constructor = Saucer;

  return Saucer;
});
