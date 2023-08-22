"use strict";

const getEdgioConfigFilePath = require('../getEdgioConfigFilePath');
/**
 * Sets the contents of edgio.config.js, overwriting the existing file.
 * This function will always overwrite the underlaying config structure,
 * as config definition is changed over time, and the old config structure
 * might not be compatible with the new config structure, so it will be
 * overwritten with the new structure.
 *
 * @param config The new config object
 * @param edgioConfigSrcPath The path to the edgio.config.js file, if not provided,
 * the default path will be used
 */


module.exports = function setConfig(config, edgioConfigSrcPath) {
  const {
    run
  } = require('jscodeshift/src/Runner');

  const inputFile = edgioConfigSrcPath || getEdgioConfigFilePath();

  const transformFile = require.resolve('./config.transform.js');

  const options = {
    verbose: 0,
    dry: false,
    print: false,
    babel: true,
    extensions: 'js',
    ignorePattern: [],
    ignoreConfig: [],
    runInBand: false,
    silent: true,
    parser: 'babel',
    stdin: false,
    config
  };
  run(transformFile, [inputFile], options);
};