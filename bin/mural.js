#!/usr/bin/env node

const program = require('commander')
const generateProject = require('../lib/new')
const generateApp = require('../lib/app')

program
  .version('0.0.1')
  .usage('name <attrs ...>')
  .parse(process.argv)

if (program.args[0] === 'app') generateApp(...program.args.slice(1))
else if (program.args[0] === 'new') generateProject(...program.args.slice(1))
