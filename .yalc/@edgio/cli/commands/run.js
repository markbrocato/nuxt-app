"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  join
} = require('path');

const {
  existsSync
} = require('fs');

const chalk = require('chalk');

const logo = require('../utils/logo');

const runDeploymentArchive = require('../utils/runDeploymentArchive');

const runWithServerless = require('../utils/runWithServerless');

const clearPorts = require('../utils/clearPorts');

const getEntryPoint = require('../utils/getEntryPoint');

const {
  isMonorepo,
  locateAppToRunCmd
} = require('../utils/monorepo');

const serveStaticAssets = require('../serverless/serveStaticAssets');

const serveImageOptimizer = require('../serverless/serveImageOptimizer');

const {
  getLocalProjectInfo
} = require('../utils/analytics');

exports.command = 'run [archive]';
exports.describe = 'Runs your project locally, simulating Edgio cloud environment. When no arguments are provided, this command is the same as edgio dev.';

exports.builder = yargs => yargs.option('production', {
  type: 'boolean',
  alias: 'p',
  describe: 'Runs your app in production mode, with caching enabled, emulating Edgio serverless runtime environment. You must first run edgio build to create a production build of your app.'
}).option('cache', {
  type: 'boolean',
  alias: 'c',
  describe: 'Enables caching in development mode. Caching is enabled by default in production mode.'
}).positional('archive', {
  describe: 'The path to a deployment archive (zip) file downloaded from Edgio Developer Console'
});

exports.handler = async ({
  context,
  production,
  archive,
  cache
}) => {
  const {
    PORTS,
    EDGIO_ENV_VARIABLES
  } = require('../constants');

  const {
    assetPort,
    imageOptimizerPort
  } = PORTS;
  process.env[EDGIO_ENV_VARIABLES.local] = 'true';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
  const {
    analytics
  } = context;
  let promiseTrackedRunning;
  const promiseTrackedRun = analytics.trackEvent('run', {
    production,
    archive,
    cache
  });
  await clearPorts();

  if (isMonorepo()) {
    await locateAppToRunCmd('run');
  }

  const edgioDir = join(process.cwd(), '.edgio');
  const assetsDir = join(edgioDir, 's3');
  const permanentAssetsDir = join(edgioDir, 's3-permanent');
  const staticAssetDirs = [assetsDir, permanentAssetsDir];

  if (!production) {
    staticAssetDirs.unshift(process.cwd());
  }

  const {
    logger
  } = context;

  if (production) {
    cache = true;
  }

  await serveStaticAssets(staticAssetDirs, assetPort);
  serveImageOptimizer(imageOptimizerPort);
  logger.info('');

  if (archive) {
    logger.info(`> Running deployed app locally using ${logo}...`);
    await runDeploymentArchive(archive);
  } else if (production) {
    if (!existsSync(edgioDir)) {
      logger.error(`\nEdgio production build not found. Please run ${chalk.green('edgio build')} before running ${chalk.green('edgio run --production')}.\n`);
      process.exit(1);
    }

    logger.info(`> Running ${logo} in production mode...`);

    if (analytics.enabledAnalytics) {
      // Don't run project info when we don't have analytics
      const projectInfo = await getLocalProjectInfo();
      promiseTrackedRunning = analytics.trackEvent('running', _objectSpread({}, {
        type: 'prod'
      }, {}, projectInfo));
    } // Edgio automatically sets this as an environment variable on the Lambda in the cloud


    process.env.NODE_ENV = 'production';
    await runWithServerless(edgioDir);
  } else {
    logger.info(`> Starting ${logo} in development mode with caching ${cache ? chalk.green('enabled') : chalk.red('disabled')}...`);

    if (analytics.enabledAnalytics) {
      // Don't run project info when we don't have analytics
      const projectInfo = await getLocalProjectInfo();
      promiseTrackedRunning = analytics.trackEvent('running', _objectSpread({}, {
        type: 'dev'
      }, {}, projectInfo));
    }

    if (cache) {
      process.env[EDGIO_ENV_VARIABLES.cache] = 'true';
    }

    const dev = await getEntryPoint('dev');
    dev();
  }

  await promiseTrackedRun;
  await promiseTrackedRunning;
};