'use strict';

/**
 * The {@link Word} is a measurement of language, often used to quantify the
 * length of a passage.
 * @type {Object}
 */
class Word {
  /**
   * A {@link Word} is an arbitrary list of characters.
   * @param  {Object} [settings={}] Configure the {@link Word} constructor.
   * @return {Word}                 Instance of the word.
   */
  constructor (settings = {}) {
    this.settings = Object.assign({
      type: 'UTF8Word'
    }, settings);
    this.type = this.settings.type;
    return this;
  }
}

module.exports = Word;
