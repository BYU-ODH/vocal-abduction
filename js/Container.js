/**
 * A purple container for the HUD
 * @constructor
 * @name Container
 * @param {string} title The text to include, if any
 * @param {number} width The width of the box
 * @param {number} height The height of the box
 */
define(function() {
  var PURPLE = 0xD7BBF9;
  var WHITE = 'white';

  function Container(title, width, height) {
    var _text = null;

    PIXI.DisplayObjectContainer.call(this);

    var rect = new PIXI.Graphics();
    rect.beginFill(PURPLE);
    rect.drawRect(0, 0, width, height);
    rect.opacity = 0.5;

    this.addChild(rect);

    if(title !== undefined && title !== null) {
      _text = new PIXI.Text(title, {
        fill: WHITE,
        //font: 'bold 20px Fjalla One', // TODO: requires a bitmap font
        font: 'bold 20px Arial',
        wordWrap: true,
        align: 'center'
      });
      _text.x = rect.width/2 - _text.width/2 + (rect.getBounds().x);
      this.addChild(_text);
    }

    Object.defineProperties(this, {
      /**
       * The height of the text, or 0 if no text
       * @memberof Container
       * @name textHeight
       */
      textHeight: {
        enumerable: true,
        get: function() {
          if(_text) {
            return _text.height;
          }
          return 0;
        }
      }
    });
  };

  Container.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Container.prototype.constructor = Container;

  return Container;
});
