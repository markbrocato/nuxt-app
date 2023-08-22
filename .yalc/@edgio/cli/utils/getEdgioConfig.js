"use strict";

const {
  slash
} = require('./utils');

const getEdgioConfigFilePath = require('./getEdgioConfigFilePath');

const chalk = require('chalk');

module.exports = function getEdgioConfig(filePath) {
  const file = filePath || getEdgioConfigFilePath();

  try {
    if (file) return require(slash(file));
  } catch (e) {
    if (e.code === 'ERR_REQUIRE_ESM') {
      console.error(chalk.red(`Error: The 'edgio.config.js' file cannot be loaded because it uses CommonJS syntax and this project is set to type module. Please rename it to 'edgio.config.cjs'.`));
      process.exit(1);
    }

    throw e;
  }

  return null;
};