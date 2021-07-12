'use strict';

const PixelEditor = require('pixel-editor');

class PixelEditorComponent {
  constructor (settings = {}) {
    this.settings = Object.assign({
      handle: 'rpg-pixel-editor'
    }, settings);
    this.editor = new PixelEditor();
    return this;
  }
}

module.exports = PixelEditorComponent;
