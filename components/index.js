'use strict';

const config = require('../settings/default');
const Application = require('./application');

// main program
async function main () {
  const app = window.application = new Application(config);

  app.on('error', function (err) {
    console.error(err);
  });

  app.envelop('*[data-bind=fabric]');
  app.render();

  await app.start();

  // TODO: move to envelop()
  document.querySelector('*[data-action=generate-identity]').addEventListener('click', app._createIdentity.bind(app));
  document.querySelector('*[data-action=toggle-fullscreen]').addEventListener('click', app._toggleFullscreen.bind(app));
  // document.querySelector('*[data-action=request-name]').addEventListener('click', app._requestName.bind(app));

  console.log('[FABRIC]', 'booted:', app);
}

module.exports = main();
