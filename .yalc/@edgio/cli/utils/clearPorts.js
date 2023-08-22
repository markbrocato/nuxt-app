"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = clearPorts;

var _killPort = _interopRequireDefault(require("kill-port"));

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Kills anything running on the ports needed for the app, JS backend, and static backend.
 */
async function clearPorts() {
  const {
    port,
    jsPort,
    assetPort,
    imageOptimizerPort
  } = _constants.PORTS;
  await Promise.all([(0, _killPort.default)(port), (0, _killPort.default)(jsPort), (0, _killPort.default)(assetPort), (0, _killPort.default)(imageOptimizerPort)]);
}

module.exports = exports.default;