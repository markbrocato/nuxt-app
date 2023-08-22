"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const build = require('../utils/build');

const {
  getLocalProjectInfo
} = require('../utils/analytics');

exports.command = 'build';
exports.describe = 'Builds your project for deployment on edgio.';
exports.builder = {
  skipFramework: {
    type: 'boolean',
    alias: 's',
    describe: 'Skips running the framework build (Next.js, Vue, Angular, etc...) and uses the existing build instead.'
  },
  includeSources: {
    type: 'boolean',
    describe: 'Includes source files in the bundle uploaded to edgio for debugging purposes based on the sources config in edgio.config.js.'
  },
  disablePermanentAssets: {
    type: 'boolean',
    describe: 'Set this to true to suppress errors like "Immutable file (...) content was changed"'
  }
};

exports.handler = async yargs => {
  const {
    context
  } = yargs;

  if (context.analytics.enabledAnalytics) {
    let analyticsParams = {};

    for (const key in exports.builder) {
      analyticsParams[key] = yargs[key];
    }

    const projectInfo = await getLocalProjectInfo();
    analyticsParams = _objectSpread({}, analyticsParams, {}, projectInfo);
    const promiseTracked = context.analytics.trackEvent('build', analyticsParams);
    await build(yargs);
    await promiseTracked;
  } else {
    await build(yargs);
  }
};