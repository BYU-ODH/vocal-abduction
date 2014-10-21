define(['IPAMap'], function(IPAMap) {
  /**
   * The IPA symbols with their appropriate locations
   * @param string sound The relevant IPA symbol
   * @constructor
   */
  function Marker(sound) {
    /**
     * Backness, in regressed MFCCs
     * @type number
     * @memberof Marker
     */
    this.vowel_backness = IPAMap[sound][0];
    /**
     * Height, in regressed MFCCs
     * @type number
     * @memberof Marker
     */
    this.vowel_height = IPAMap[sound][1];
    
    PIXI.DisplayObjectContainer.call(this);

    // TODO: adjust font to taste
    var text = new PIXI.Text(sound);
    this.addChild(text);

    // TODO: make cow wander around
  };
  
  Marker.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Marker.prototype.constructor = Marker;

  return Marker;
});
