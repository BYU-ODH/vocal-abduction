define(['Corpus'], function(Corpus) {
  var DEFAULT_TIME = 60,
      ONE_SECOND  = 1000,
      YELLOW      = '#ffef7b';

  /**
   * The Console that gives the current challenge.
   *
   * Events:
   *  - ready (when the SVG has finished loading)
   *  - timeend (when the timer has completed)
   *
   * @param language The language to use on the board, an ISO 639-3 code
   * @param graphicsPath
   * @constructor
   */
  function Console(language, graphicsPath) {
    var _this  = this,
        /**
         * The amount of time remaining, in seconds
         * @type number
         */
        _time  = null,

        /**
         * A dictionary of sounds and example words for the language
         * @type Object
         */
        _words = Corpus[language],

        /**
         * The current word
         * @type string
         */
        _word = null,

        /**
         * The current sound
         * @type string
         * @memberof Console
         * @name sound
         */
        _sound = null,

        /**
         * The element for the timer text
         */
        _timerTextNode = null,
        /**
         * The element for the word text
         */
        _wordTextNode = null,

        /**
         * The countdown timer
         */
        _timer = null;

    /**
     * The SVG element you can append to the document
     * @memberof Console
     */
    _this.element = document.createElement('embed');

    /**
     * Given a time, in seconds, converts to a mm:ss format
     * @param number seconds The time to convert
     * @return string
     */
    function _formatTime(seconds) {
      var s = seconds%60;
      var m = Math.floor(seconds/60);

      return (m < 10 ? '0'+m : m) + ':' + (s < 10 ? '0'+s : s);
    };

    /**
     * Grabs a random integer between two given numbers
     * @param number min
     * @param number max
     * @return number
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     */
    function _randBetween(min, max) {
      return Math.floor(Math.random()*(max-min+1)+min);
    }

    /**
     * Returns a random sound from the dictionary
     * @return string
     * @see _getRandomWord
     */
    function _getRandomSound() {
      var keys = Object.keys(_words)
      return keys[_randBetween(0, keys.length-1)];
    };

    /**
     * Retrieves a random word from the dictionary
     * @param sound A sound with which to find an example word
     * @return string
     * @see _getRandomSound
     */
    function _getRandomWord(sound) {
      var examples = _words[sound];
      return examples[_randBetween(0, examples.length-1)];
    };

    /**
     *  Removes one second from the timer and updates the screen
     */
    function _countdown() {
      if(_time <= 0) {
        return;
      }
      _time--;
      _updateTime(_time);

      if(_time <= 0) {
        _this.emit({type: 'timeend'});
      }
    };

    /**
     * Updates the screen with a new word
     * @param string word The word to show on the screen
     */
    function _updateWord(word) {
      _word = word;
      _wordTextNode.textContent = word;
    };

    /**
     * Updates the screen with the current time
     * @param number time in seconds
     */
    function _updateTime(time) {
      _timerTextNode.textContent = _formatTime(_time);
    }

    (function _init() {
      PIXI.EventTarget.call(_this);

      if(!_words) {
        throw "Language " + language + " not found.";
      }
      var el = _this.element;

      el.src  = graphicsPath + 'console.svg';
      el.type = 'image/svg+xml';

      el.addEventListener('load', function() {
        var svg = el.getSVGDocument().children[0];
        var ns = svg.namespaceURI;

        var screen = svg.getElementById('screen');
        var box = screen.getBBox();

        var timerEl = document.createElementNS(ns, 'text');
        var wordEl  = document.createElementNS(ns, 'text');

        window.svg = svg;

        [timerEl, wordEl].forEach(function(el) {
          el.setAttribute('font-size', '26px');
          el.setAttribute('fill', YELLOW);
          el.setAttribute('text-anchor', 'middle');

          el.setAttribute('x', box.x + box.width/2);

          svg.appendChild(el);
        });

        // TODO: needs to scale
        wordEl.setAttributeNS(null, 'y', 75);
        timerEl.setAttributeNS(null, 'y', 130);

        _wordTextNode = document.createTextNode('RECEIVING');
        _timerTextNode = document.createTextNode('TRANSMISSION');

        timerEl.appendChild(_timerTextNode);
        wordEl.appendChild(_wordTextNode);

        _this.emit({type: 'ready'});
      });
    })();

    /**
     * Loads a new random word, clearing the timer.
     * @memberof Console
     * @name loadWord
     */
    _this.loadWord = function() {
      _sound = _getRandomSound();

      var word  = _getRandomWord(_sound);
      _updateWord(word);
    };

    _this.startTimer = function() {
      _time = DEFAULT_TIME;
      _updateTime(_time);
      window.clearInterval(_timer);
      _timer = window.setInterval(_countdown, ONE_SECOND);
    };

    Object.defineProperties(_this, {
      sound: {
        enumerable: true,
        get: function() { return _sound; }
      },
    });
  };
  return Console;
});
