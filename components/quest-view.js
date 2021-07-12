'use strict';

const Component = require('@fabric/http/types/component');

class QuestView extends Component {
  constructor (settings = {}) {
    super(settings);
    this.settings = Object.assign({
      title: 'Quest Details',
      handle: 'rpg-quest-view'
    }, settings);
    return this;
  }

  _getInnerHTML () {
    return `<h2>${this.settings.title}</h2>`;
  }

  render () {
    return `<${this.settings.handle}>${this._getInnerHTML()}</${this.settings.handle}>`;
  }
}

module.exports = QuestView;
