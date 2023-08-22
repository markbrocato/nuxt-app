"use strict";

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const resolveInPackage = require('./resolveInPackage');

const getEdgioConfig = require('./getEdgioConfig');

const {
  slash
} = require('./utils');

const {
  join
} = require('path');

const {
  existsSync
} = require('fs');

const {
  getInstallCommand
} = require('./packageManager');

const chalk = require('chalk');
/**
 * Gets the specified entrypoint based on the value of the connector property in edgio.config.js
 * @param {String} name The entry point name
 * @return {Object} The default export or module.exports of the entrypoint
 */


module.exports = async function getEntryPoint(name) {
  var _getEdgioConfig;

  let connector = ((_getEdgioConfig = getEdgioConfig()) === null || _getEdgioConfig === void 0 ? void 0 : _getEdgioConfig.connector) || '@edgio/core';
  let entryPoint;

  if (connector.startsWith('.')) {
    // relative path - ad hoc connector in the app itself
    entryPoint = [join(process.cwd(), connector, `${name}.cjs`), // CommonJS - use require
    join(process.cwd(), connector, `${name}.mjs`), // ES Module - use import
    join(process.cwd(), connector, `${name}.js`) // Treating as CommonJS - use require
    ].find(file => existsSync(file));

    if (!entryPoint) {
      // Load the entry point default from the core.
      entryPoint = resolveInPackage('@edgio/core', name);
    }
  } else {
    // a connector package
    try {
      entryPoint = resolveInPackage(connector, name);
    } catch (e) {
      console.error(`Connector package ${connector} not found. Try installing it with\n\n  ${chalk.yellow(`${getInstallCommand()} ${connector}`)}\n`);
      process.exit(1);
    }
  }

  const mod = entryPoint.endsWith('.mjs') ? await Promise.resolve().then(() => _interopRequireWildcard(require(`${slash(entryPoint)}`))) : require(slash(entryPoint));
  return mod.default || mod;
};