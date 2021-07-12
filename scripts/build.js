'use strict';

const config = require('../settings/default');

const SPA = require('@fabric/http/types/spa');
const Compiler = require('@fabric/http/types/compiler');

async function main () {
  let spa = new SPA(config);
  let compiler = new Compiler({
    document: spa
  });

  compiler.compileTo('assets/index.html');

  process.exit();
}

main();
