"use strict";

var _getPackageVersion = _interopRequireDefault(require("../frameworks/getPackageVersion"));

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chalk = require('chalk');

const versionMismatchWarning = context => {
  const {
    logger
  } = context;
  const edgioCoreVersion = (0, _getPackageVersion.default)('@edgio/core');
  const layer0CoreVersion = edgioCoreVersion || (0, _getPackageVersion.default)('@layer0/core');
  const corePackageName = edgioCoreVersion ? '@edgio/core' : '@layer0/core';
  const packageVersion = edgioCoreVersion ? edgioCoreVersion : layer0CoreVersion;

  if (packageVersion && _constants.CLI_VERSION !== packageVersion.raw) {
    const cliPackageName = edgioCoreVersion ? '@edgio/cli' : '@layer0/cli';
    logger.warn('⚠️', ` WARNING - CLI/CORE Version mismatch`);
    logger.warn('');
    logger.warn(`You are running ${chalk.green(`${cliPackageName} v${_constants.CLI_VERSION}`)} but your project is using ${chalk.green(`${corePackageName} v${packageVersion}`)}`);
    logger.warn(`These versions should be aligned. Please add ${chalk.green(`${cliPackageName}`)} into your package.json:`);
    logger.warn(`${chalk.green(`devDependencies: {"${cliPackageName}": "${packageVersion}"}`)}`);
    logger.warn('');
  }
};

module.exports = versionMismatchWarning;