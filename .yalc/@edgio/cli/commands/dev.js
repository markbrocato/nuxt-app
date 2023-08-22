"use strict";

exports.command = 'dev';
exports.describe = 'Runs your project in development mode, simulating Edgio cloud environment. This command is a simplified version of edgio run, with only the --cache option being supported.';

exports.builder = yargs => yargs.option('cache', {
  type: 'boolean',
  alias: 'c',
  describe: 'Enables caching.'
});

exports.handler = async ({
  context,
  cache
}) => {
  const {
    analytics
  } = context; // Keep in mind that each "dev" command is also running "run" command

  const promiseTracked = analytics.trackEvent('dev', {
    cache
  });

  const runHandler = require('./run').handler;

  await runHandler({
    context,
    cache
  });
  await promiseTracked;
};