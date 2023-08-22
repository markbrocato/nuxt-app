"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  CLI_VERSION: true,
  CLI_PACKAGE_NAME: true,
  EDGIO_IMAGE_OPTIMIZER_PATH: true,
  DEPLOYMENT_MANIFEST_FILE: true,
  PRODUCT_NAME: true,
  MAIN_COMMAND: true,
  MIXPANEL_TOKEN: true,
  API_URL: true,
  API_STG_URL: true,
  DOCS_URL: true,
  ENV_DISABLE_ANALYTICS: true,
  DISABLED_ANALYTICS_ENV: true
};
exports.DISABLED_ANALYTICS_ENV = exports.ENV_DISABLE_ANALYTICS = exports.DOCS_URL = exports.API_STG_URL = exports.API_URL = exports.MIXPANEL_TOKEN = exports.MAIN_COMMAND = exports.PRODUCT_NAME = exports.DEPLOYMENT_MANIFEST_FILE = exports.EDGIO_IMAGE_OPTIMIZER_PATH = exports.CLI_PACKAGE_NAME = exports.CLI_VERSION = void 0;

var _core = require("./core");

Object.keys(_core).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _core[key];
    }
  });
});
let CLI_VERSION;
exports.CLI_VERSION = CLI_VERSION;
let CLI_PACKAGE_NAME;
exports.CLI_PACKAGE_NAME = CLI_PACKAGE_NAME;

try {
  // We are in /dist production mode, package.json is on the same level
  exports.CLI_VERSION = CLI_VERSION = require('./package.json').version;
  exports.CLI_PACKAGE_NAME = CLI_PACKAGE_NAME = require('./package.json').name;
} catch (_e) {
  try {
    // We are in non build environment, we are inside /src folder
    // this is case for example unit testing
    exports.CLI_VERSION = CLI_VERSION = require('../package.json').version;
    exports.CLI_PACKAGE_NAME = CLI_PACKAGE_NAME = require('../package.json').name;
  } catch (e) {// In case we don't get it, it doesn't matter - used for analytics
  }
}

const EDGIO_IMAGE_OPTIMIZER_PATH = '/__layer0_image_optimizer';
exports.EDGIO_IMAGE_OPTIMIZER_PATH = EDGIO_IMAGE_OPTIMIZER_PATH;
const DEPLOYMENT_MANIFEST_FILE = 'deployment-manifest.json';
exports.DEPLOYMENT_MANIFEST_FILE = DEPLOYMENT_MANIFEST_FILE;
const PRODUCT_NAME = 'Edgio';
exports.PRODUCT_NAME = PRODUCT_NAME;
const MAIN_COMMAND = 'edgio';
exports.MAIN_COMMAND = MAIN_COMMAND;
const MIXPANEL_TOKEN = '879d248b0d5fb00c23c003b5c8386017';
exports.MIXPANEL_TOKEN = MIXPANEL_TOKEN;
const API_URL = 'https://api.edgio.app';
exports.API_URL = API_URL;
const API_STG_URL = 'https://api.edgio-stage.app';
exports.API_STG_URL = API_STG_URL;
const DOCS_URL = 'https://docs.edg.io'; // ENV variable for disabling the analytics

exports.DOCS_URL = DOCS_URL;
const ENV_DISABLE_ANALYTICS = 'EDGIO_DISABLE_ANALYTICS';
exports.ENV_DISABLE_ANALYTICS = ENV_DISABLE_ANALYTICS;
const DISABLED_ANALYTICS_ENV = process.env[ENV_DISABLE_ANALYTICS];
exports.DISABLED_ANALYTICS_ENV = DISABLED_ANALYTICS_ENV;