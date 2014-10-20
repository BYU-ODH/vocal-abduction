vocal-abduction
===============

Pronunciation game using BYU-ODH/apeworm

Development
-------------

### Requirements

* npm
* bower
* [TexturePacker Command Line Tool](https://www.codeandweb.com/texturepacker/download) (should come with TexturePacker)
* grunt-cli
* ImageMagick
* GraphicsMagick

To prepare assets, run the following commands:

* `npm install` (install grunt dependencies)
* `bower install` (install bower dependencies)
* `grunt wiredep` (adds bower dependencies to index.html)
* `grunt sprites` (creates spritesheet)

The index.html file is found under the `app/` directory.

If you have questions, feel free to post an issue.

### Making Display Objects:

All JavaScript classes should be wrapped in require.js callbacks and should 
extend the DisplayObjectContainer class of PIXI.js. Here's a minimal example

in a file called `app/js/FinglyFlangle.js`

```javascript
define(function() {
  function FinglyFlangle() {
    PIXI.DisplayObjectContainer.call(this);
    PIXI.EventTarget.call(this);
  };
  FinglyFlangle.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  FinglyFlangle.prototype.constructor = FinglyFlangle;
  return FinglyFlangle;
});
```
