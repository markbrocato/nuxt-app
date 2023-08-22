"use strict";

const dns = require('dns').promises;

const ipaddr = require('ipaddr.js');

class Validator {
  constructor(logger, options = {
    exitOnError: false,
    throwError: false,
    logError: true
  }) {
    var _options$exitOnError, _options$throwError, _options$logError;

    this.logger = logger;
    this.exitOnError = (_options$exitOnError = options.exitOnError) !== null && _options$exitOnError !== void 0 ? _options$exitOnError : false;
    this.throwError = (_options$throwError = options.throwError) !== null && _options$throwError !== void 0 ? _options$throwError : false;
    this.logError = (_options$logError = options.logError) !== null && _options$logError !== void 0 ? _options$logError : true;
    this.errors = [];
  }

  get success() {
    return this.errors.length === 0;
  }

  handleError(errorMessage) {
    this.errors.push(errorMessage);

    if (this.logError) {
      this.logger.error(`Error: ${errorMessage}`);
    }

    if (this.throwError) {
      throw new Error(errorMessage);
    }

    if (this.exitOnError) {
      process.exit(1);
    }
  }

  validateSiteName(siteName) {
    if (!siteName) {
      this.handleError(`Couldn't find the site's name. Please add the name property to your package.json file or specify --site param.`);
    }

    if (typeof siteName != 'string') {
      this.handleError(`Site's name has to be string.`);
    }

    if ((siteName === null || siteName === void 0 ? void 0 : siteName.length) === 0) {
      this.handleError(`Site's name can't be empty.`);
    }

    return siteName;
  }
  /**
   * Validates the `location` as defined in `config.origins` is either a resolvable
   * domain or a valid IP address format (does not validate connection to IP). If the value
   * as a domain does not resolve, and the value as an IP address does not validate, a
   * warning is logged indicating a potentially unreachable backend.
   *
   * @param {Object} config
   * @returns {Boolean} `true` if all backends are valid; `false` otherwise
   */


  async validateBackends(config) {
    const {
      origins
    } = config !== null && config !== void 0 ? config : {};
    let valid = true;
    if (!origins) return valid;

    for (let {
      name,
      hosts
    } of origins) {
      for (let {
        location
      } of hosts) {
        /**
         * We trim it in case it contains newlines, which would cause dns to not resolve, print error.
         * This mirrors the approach we take towards edgio.config in general inside of core package.
         */
        const trimmedLocation = location !== null && location !== void 0 && location.trim ? location.trim() : location; // Currently only IPv4 is supported as a backend. This validates based on pattern.

        const isValidIP = ipaddr.IPv4.isIPv4(trimmedLocation); // continue to next entry; skip dns resolution

        if (isValidIP) continue;

        try {
          await dns.resolve(trimmedLocation);
        } catch (e) {
          // at this point we're not a valid IP nor resolvable by dns
          this.logger.warn(`Unable to validate domain/IP '${trimmedLocation}' for backend '${name}'.`, 'This may result in failed requests if the domain/IP address cannot be reached after deployment.\n');
          valid = false;
        }
      }
    }

    return valid;
  }

}

module.exports = Validator;