"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = detectFramework;

var _frameworks = _interopRequireDefault(require("./frameworks"));

var _EdgioPackageJson = _interopRequireDefault(require("../utils/EdgioPackageJson"));

var _semver = _interopRequireDefault(require("semver"));

var _getPackageVersion3 = _interopRequireDefault(require("./getPackageVersion"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Detects the framework being used by the project in the current working directory
 * @param returnPackageInstead {boolean} If true returns the framework from package.json instead of
 * @returns {Object} From './frameworks' or Object from package.json {"@edgio/cli": "^4.18.8"}
 */
async function detectFramework(returnPackageInstead = false) {
  const {
    dependencies = {},
    devDependencies = {}
  } = _EdgioPackageJson.default.loadPackageJson();

  const dependenciesPairs = Object.keys(dependencies).map(key => {
    var _getPackageVersion$ra, _getPackageVersion;

    return {
      package: key,
      version: (_getPackageVersion$ra = (_getPackageVersion = (0, _getPackageVersion3.default)(key)) === null || _getPackageVersion === void 0 ? void 0 : _getPackageVersion.raw) !== null && _getPackageVersion$ra !== void 0 ? _getPackageVersion$ra : dependencies[key]
    };
  });
  const devDependenciesPairs = Object.keys(devDependencies).map(key => {
    var _getPackageVersion$ra2, _getPackageVersion2;

    return {
      package: key,
      // Attempt to read package version from node_modules, if possible
      // otherwise, fallback to the version found in main package.json
      // and coerce the version found there as semver will fail if version
      // name is not clean (aka to get from ^1.2.3 version 1.2.3 which can be compared)
      version: (_getPackageVersion$ra2 = (_getPackageVersion2 = (0, _getPackageVersion3.default)(key)) === null || _getPackageVersion2 === void 0 ? void 0 : _getPackageVersion2.raw) !== null && _getPackageVersion$ra2 !== void 0 ? _getPackageVersion$ra2 : devDependencies[key]
    };
  });
  const all = dependenciesPairs.concat(devDependenciesPairs).map(pair => ({
    package: pair.package,
    version: _semver.default.coerce(pair.version)
  })); // The frameworks array order is important, the more specific versions
  // has to be defined before less specific version(s). Also some frameworks
  // take priority before others eg vue-storefront vs nuxt

  for (const fw of _frameworks.default) {
    const foundPackageFrameworkMatch = all.find(packageFramework => // If the version is not specified we care only about the name,
    // otherwise we check for framework version too
    fw.frameworkVersion === undefined ? packageFramework.package === fw.framework : packageFramework.package === fw.framework && _semver.default.satisfies(packageFramework.version, fw.frameworkVersion));

    if (foundPackageFrameworkMatch) {
      if (returnPackageInstead) {
        return foundPackageFrameworkMatch;
      } else {
        return fw;
      }
    }
  } // No matching framework has been found


  return undefined;
}

module.exports = exports.default;