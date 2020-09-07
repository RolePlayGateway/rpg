'use strict';

const telnet = require('telnet2');
const CLI = require('@fabric/core/types/cli');

async function main () {
  const server = telnet({ tty: true }, async function (client) {
    const cli = new CLI({
      input: client,
      output: client,
      terminal: 'xterm-256color',
      fullUnicode: true
    });

    await cli.start();

    client.on('debug', function(msg) {
      console.error(msg);
    });

    client.on('term', function(terminal) {
      cli.screen.terminal = terminal;
      cli.screen.render();
    });

    client.on('size', function(width, height) {
      client.columns = width;
      client.rows = height;
      client.emit('resize');
    });

    client.on('close', function() {
      if (!cli.screen.destroyed) {
        cli.screen.destroy();
      }
    });

    cli.screen.on('destroy', function() {
      if (client.writable) {
        client.destroy();
      }
    });
  });

  server.listen(2300);
}

main().catch((exception) => {
  console.error('[SCRIPT:TELNET]', 'Main process emtted exception:', exception);
});