#! /usr/bin/env node

import 'babel-polyfill';
import yargs from 'yargs';
import docItForMe from '../lib';
import glob from 'glob';
import fs from 'fs';
import Source from '../lib/Source';

yargs
  .usage('$0 [OPTIONS] [FILES]')
  .help('help')
  .option({
  });


if (!yargs.argv._.length) {
  console.log(yargs.help());
  process.exit(0);
}

let sources = yargs.argv._
  .map(pattern => glob.sync(pattern))
  .reduce((result, paths) => result.concat(paths), [])
  .map(filePath => {
    return new Source({
      raw: fs.readFileSync(filePath).toString(),
      path: filePath
    });
  });


let results = docItForMe(sources);

console.log(results[0].value);
