#!/usr/bin/env node
// Note that this file is usually invoked through cli-local, which loads the CLI from
// local node_modules if present.
// But, when developing on the CLI specifically, we can run this file directly.
"use strict";

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function main() {
  const {
    EOL
  } = require('os');

  const latestVersionWarning = require('./prompts/latestVersionWarning');

  const yargs = await Promise.resolve().then(() => _interopRequireWildcard(require('yargs')));

  const chalk = require('chalk');

  const Context = require('./utils/context');

  const isCI = require('is-ci');

  const initContext = async argv => {
    argv.context = new Context(argv);
  };

  yargs.scriptName('edg').middleware(initContext).commandDir('commands').command({
    command: 'curl',
    describe: 'edgio curl client. Refer to "0 curl --help" for documentation'
  }).option('api-url', {
    type: 'string',
    description: 'edgio Developer Console URL',
    // TODO: Change the domain - APPOPS-15850 We are unable to change the domain of API at the moment.
    default: 'https://api.edgio.app'
  }).options('token', {
    type: 'string',
    description: 'Authenticate with a specific site deploy token. You can also specify the token by setting the EDGIO_DEPLOY_TOKEN environment variable.'
  }).option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  }).option('local', {
    type: 'boolean',
    hidden: true
  }).option('dev', {
    type: 'boolean',
    hidden: true
  }).option('stage', {
    type: 'boolean',
    hidden: true
  }).options('ignore-error', {
    type: 'string',
    hidden: true
  }).options('non-interactive', {
    alias: 'ni',
    type: 'boolean',
    description: 'Runs the command without user interaction. Default to false, except when a known CI env variable is detected',
    default: isCI
  }).strict().completion('completion', 'Generates a script that you can add to your shell to enable autocompletions for the edgio command').demandCommand().middleware([latestVersionWarning]).fail((msg, err, yargs) => {
    try {
      if (err) {
        if (err.isUserError) {
          // An error that occurred in the normal user workflow:
          // (failed sign-in, team slug not found, javascript build failure, etc...)
          // in which case we don't want to display a stack trace but just a specific error message
          console.error(chalk.red.bold(`${EOL}${err.message}${EOL}`));

          if (err.errorDetails) {
            console.error(chalk.red(err.errorDetails));
          }
        } else {
          // Default error outputs otherwise
          console.error(err);
        }

        return;
      }

      console.log(yargs.help());
      console.log(msg);
    } catch (e) {
      // Any error thrown into fail() callback would be silenced so we make sure
      // nothing pops out
      console.error('Error in .fail():', err);
    } finally {
      process.exit(-1);
    }
  }).showHelpOnFail(false).argv;
}

main();