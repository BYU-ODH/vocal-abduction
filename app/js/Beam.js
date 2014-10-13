define(function() {
  /**
   * Percentage, between cow and ship, that the beam should end at
   * @const
   * @type number
   */
  var MAX_BEAM_DISTANCE = 108;
  /**
   * Percentage, between ship and cow, that the beam should start at
   * @const
   * @type number
   */
  var MIN_BEAM_DISTANCE = 0;
  /**
   * how long the cow should stay tinted before earning a point
   * @const
   * @type number
   */
  var COW_GET_DELAY = 250;

  /**
   * The color of the cow when it has been hit by the tractor beam
   * @type number
   * @const
   */
  var COW_TINT = 0x77FF77;

  /**
   * The saucer profile that measures how close a player is to abducting a cow.
   * When the player has retrieved a cow, this emits an 'abduct' event.
   *
   * @param {Object=} options Configuration options
   * @param {number=} [options.color] The color for the ship. @see Color
   * @param {number=} [options.speed=3] how quickly the beam should descend or
   * ascend, between 1 and 5, 5 being the fastest.
   *
   * @example
   *  var b = new Beam();
   *  b.on('abduct', functon doSomething(){console.log('something'});
   *  b.active = true;
   *
   * @constructor
   * @name Beam
   */
  function Beam(options) {
    var _this = this,
        _ship = new PIXI.Sprite.fromFrame('gaugeHeader.png'),
        _beam = new PIXI.Sprite.fromFrame('tractorBeam.png'),
        _cow = new PIXI.Sprite.fromFrame('cowProfile.png'),

        /**
         * The color of the ship. @see Color
         * @name color
         * @memberof Beam
         * @type number
         */
        _color,

        /**
         * Whether or not the ascent and descent functions should respond.
         * If this is true, tractor beam will neither ascend nor descend.
         * The beam will pause momentarily when the cow has been hit.
         * @type boolean
         */
        _paused = false,

        /**
         * A number between MIN_BEAM_DISTANCE and MAX_BEAM_DISTANCE, representing how close the beam is to the cow
         * @private
         * @memberof Beam
         * @type number
         */
        _distance = MIN_BEAM_DISTANCE,
        /**
         * Whether or not the beam should be descending
         * @name active
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
        _ascentInterval = null,
        _descentInterval = null,
        /**
         * The maximum height the beam can be before it touches the cow.
         * @type number
         */
        _maxBeamHeight = null,
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
      // tall enough to fit the cow, the ship, with room for the beam
      var height = (_cow.height + _ship.height)*2.5;
      
      _cow.anchor.x = 0.5;
      _cow.y = height - _cow.height;
      _cow.x = _ship.width/2;
      _this.addChild(_cow);

      _beam.anchor.x = 0.5;
      _beam.y = _ship.height - 25;
      _beam.x = _ship.width/2;
      _beam.height = 0;
      _beam.opacity = 0.7;
      _this.addChild(_beam);

      _maxBeamHeight = height - _cow.height - _ship.height;
      
      _this.addChild(_ship);
      
      Beam._index++;

      // so we can dispatch events (@see _retrieveCow)
      PIXI.EventTarget.call(_this);
    };

    /**
     * Sets the distance of the tractor beam
     * @param number value Must be between MIN_BEAM_DISTANCE and MAX_BEAM_DISTANCE
     * @see score
     */
    function _setDistance(value) {
      if(Number.parseInt(value) < MIN_BEAM_DISTANCE || Number.parseInt(value) > MAX_BEAM_DISTANCE) {
        throw "Tractor beam distance must be between " + MIN_BEAM_DISTANCE +
          '-' + MAX_BEAM_DISTANCE + ". Given: " + value;
      }
      _distance = value;
      _beam.height = (_distance/100)*_maxBeamHeight;
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
      _resetMotion();
    };

    /**
     * Resets tractor beam's motion, which depends on whether or not the beam
     * is enabled and the current speed of the beam
     */
    function _resetMotion() {
      clearInterval(_descentInterval);
      clearInterval(_ascentInterval);

      if(_enabled) {
        _descentInterval = setInterval(_descend, _this.speed);
      }
      else
      {
        _ascentInterval = setInterval(_ascend, _this.speed);
      }
    }

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

    function _ascend() {
      if(_paused) { return; }

      if(_distance <= MIN_BEAM_DISTANCE) { return; }
      _setDistance(_distance-1);
    };

    function _descend() {
      if(_paused) { return; }

      if(_distance >= MAX_BEAM_DISTANCE) {
        _retrieveCow();
        return;
      }
      _setDistance(_distance+1);
    };

    /**
     * @param boolean value Whether or not the beam should be enabled
     */
    function _setEnabled(value) {
      if(value == _enabled) {
        return;
      }
      _enabled = !!value;
      _resetMotion();
    };

    /**
     * Used when a beam hits the cow 
     */
    function _retrieveCow() {
      _paused = true;
      _cow.tint = COW_TINT;

      setTimeout(function() {
        _cow.tint = 0xFFFFFF;
        _paused = false;
        _setDistance(MIN_BEAM_DISTANCE);
        _this.emit({type: 'abduct'});
      }, COW_GET_DELAY);
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
      active: {
        enumerable: true,
        get: function() { return _enabled; },
        set: _setEnabled
      }
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
