"use strict";

var _fs = require("fs");

var _constants = require("../constants");

var _utils = require("./utils");

/**
 * Runs the bundled app, simulating the serverless environment
 * @param dir The .edgio directory
 */
module.exports = async function runWithServerless(dir) {
  const {
    port,
    localhost
  } = _constants.PORTS;

  const {
    join
  } = require('path');

  const serveFunction = require('../serverless/serveFunction');

  const chalk = require('chalk');

  const jsDir = join(dir, 'lambda');
  process.chdir(jsDir);
  process.env.NODE_ENV = 'production';
  process.env[_constants.EDGIO_ENV_VARIABLES.deploymentType] = 'AWS'; // needed for environment.isCloud() to return true

  process.env[_constants.EDGIO_ENV_VARIABLES.productionBuild] = 'true';
  process.env[_constants.EDGIO_ENV_VARIABLES.cache] = 'true';
  process.env[_constants.EDGIO_ENV_VARIABLES.local] = 'true'; // this turns off the wrapping of stdout, stderr
  // lambda server

  const handlerPath = [(0, _utils.slash)(jsDir) + '/handler.ts', (0, _utils.slash)(jsDir) + '/handler.cjs'].find(_fs.existsSync) || (0, _utils.slash)(jsDir) + '/handler.js';

  const handler = require(handlerPath).handler;

  serveFunction(handler, port);
  console.log(chalk.green(`> Application ready on http://${localhost}:${port}`));
};