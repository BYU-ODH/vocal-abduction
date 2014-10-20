define(function() {
  /**
   * The Console that gives the current challenge
   * @param language The language to use on the board
   * @param graphicsPath 
   * @constructor
   */
  function Console(language, graphicsPath) {
    var _that = this;
    /**
     * The SVG element you can append to the document
     * @memberof Console
     */
    _that.element = document.createElement('embed');

    (function _init() {
      _that.element.src  = graphicsPath + 'console.svg';
      _that.element.type = 'image/svg+xml';
    })();
  };
  return Console;
});
