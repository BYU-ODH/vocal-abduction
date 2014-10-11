define(['Color'], function(Color) {
  /**
   * The saucer profile that measures how close a player is to abducting a cow
   * @param {Object=} options Configuration options
   * @param {number=} [options.color] The color for the ship. @see Color
   * @param {number=} [options.speed=3] how quickly the beam should descend or
   * ascend, between 1 and 5, 5 being the fastest.
   * @constructor
   * @name Beam
   */
  function Beam(options) {
    var _this = this,
        _sprite,
        /**
         * The color of the ship. @see Color
         * @name color
         * @memberof Beam
         * @type number
         */
        _color,
        /**
         * A number between 0 and 100, representing how close the beam is to the cow
         * @private
         * @memberof Beam
         * @type number
         */
        _distance,
        /**
         * Whether or not the beam should be descending
         * @name enabled
         * @memberof Beam
         * @type boolean
         */
        _enabled = false,
        /**
         * Maps chosen speeds to times
         * @type Object
         */
        _speeds = {
          1: 1000,
          2: 850,
          3: 700,
          4: 650,
          5: 500
        },
        options = options || {},
        /**
         * The speed that the tractor beam moves
         * @memberof Beam
         * @type number
         * @name speed
         */
        _speed = _speeds[3];

    PIXI.DisplayObjectContainer.call(_this);

    function _init() {
      var color_count = Object.keys(Color).length;
      var key = Object.keys(Color)[Beam._index % color_count];

      _color = options.color || Color[key];

      _sprite = new PIXI.Sprite.fromFrame(_color + 'Saucer.png');
      _this.addChild(_sprite);
      
      Beam._index++;
    };

    /**
     * Sets the distance of the tractor beam
     * @param number value Must be between 0 and 100
     * @see score
     */
    function _setDistance(value) {
      if(Number.parseInt(value) < 0 || Number.parseInt(value) > 100) {
        throw "Tractor beam distance must be between 0-100. Given: " + value;
      }
      _distance = value;
    };
    
    /**
     * Sets the speed of the tractor beam
     * @param number value A number, from 1 to 5, representing how fast the
     * tractor beam should move
     * @see speed
     */
    function _setSpeed(value) {
      var speed = _speeds[value];

      if(speed === undefined) {
        throw "Tractor beam speed must be between 1-5. Given: " + value;
      }
      _speed = speed;
    };

    /**
     * Gets the speed of the tractor beam
     * @return number A number, from 1 to 5, representing how fast the tractor
     * beam is moving
     * @see speed
     */
    function _getSpeed() {
      for(key in _speeds) {
        if(_speeds[key] === _speed) {
          return key;
        }
      }
    };

    Object.defineProperties(_this, {
      color: {
        enumerable: true,
        get: function() { return _color; }
      },
      speed: {
        enumerable: true,
        get: _getSpeed,
        set: _setSpeed
      },
    });

    _init();
  };

  /**
   * Keeps track of how many saucers have been created (for colorization's sake)
   * @type number
   */
  Beam._index = 0;
  Beam.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Beam.prototype.constructor = Beam;

  return Beam;
});
