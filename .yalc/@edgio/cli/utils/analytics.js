"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeAnalyticsID = exports.disableAnalytics = exports.enableAnalytics = exports.analyticsInfoMessage = exports.getLocalProjectInfo = exports.Analytics = void 0;

var _getEdgioConfig = _interopRequireDefault(require("./getEdgioConfig"));

var _detectFramework = _interopRequireDefault(require("../frameworks/detectFramework"));

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  EOL
} = require('os');

const Mixpanel = require('mixpanel');

const crypto = require('crypto');

const {
  getAnalyticsClientID,
  setAnalyticsClientID,
  getAnalyticsEnabled,
  setAnalyticsEnabled,
  deleteAnalyticsClientID
} = require('./config');
/**
 * This function can get us information such as
 *  - Used connector
 *  - Used framework
 *  - Used frameworkVersion
 *  We are getting those values in our code anyway, but it's rooted deeply in our code
 *  for the purpose of the analytics we need get this info at the start of our program.
 * @returns {Promise<{connector}|{framework: string, frameworkVersion: unknown, connector}|{}>}
 */


const getLocalProjectInfo = async () => {
  let analysis = {};

  try {
    const {
      connector
    } = (0, _getEdgioConfig.default)();
    const frameworkFromPackageJSON = await (0, _detectFramework.default)(true);

    if (frameworkFromPackageJSON) {
      return {
        connector,
        framework: frameworkFromPackageJSON.package,
        frameworkVersion: frameworkFromPackageJSON.version.version
      };
    } else {
      return {
        connector
      };
    }
  } catch (_e) {// We don't care if we fail, this is just analytics
  }

  return analysis;
};

exports.getLocalProjectInfo = getLocalProjectInfo;

const generateUUID = () => {
  // Used only on older systems
  const manuallyGenerateUUID = () => {
    let d = new Date().getTime(),
        d2 = performance && performance.now && performance.now() * 1000 || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = Math.random() * 16;

      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }

      return (c === 'x' ? r : r & 0x7 | 0x8).toString(16);
    });
  };

  let uuid;

  try {
    // It's available from Node v14.17.0+
    uuid = crypto.randomUUID();
  } catch (_e) {
    uuid = manuallyGenerateUUID();
  }

  return uuid;
};

const commandToDisableAnalytics = `${_constants.MAIN_COMMAND} config set-analytics false`;
const analyticsInfoMessage = `${_constants.PRODUCT_NAME} CLI is optionally collecting usage and error reporting information to help improve our products. All personal data is omitted.` + ` If you wish to disable the analytics, you can do so with command:${EOL}${commandToDisableAnalytics}${EOL}Or you can disable them using ENV variable ${_constants.ENV_DISABLE_ANALYTICS}${EOL}`;
exports.analyticsInfoMessage = analyticsInfoMessage;

const enableAnalytics = () => {
  setAnalyticsEnabled(true);
};

exports.enableAnalytics = enableAnalytics;

const disableAnalytics = () => {
  setAnalyticsEnabled(false);
};

exports.disableAnalytics = disableAnalytics;

const removeAnalyticsID = () => {
  deleteAnalyticsClientID();
};
/**
 * Disabled analytics:
 * If analytics are disabled, the instance of analytics doesn't have
 * clientID setup. All the functions which are called on this class
 * will do nothing in that case.
 *
 * Source CLI:
 * All the events and personas setup in the MixPanel have property "source"
 * set to "cli" as we are mixing events from console too.
 */


exports.removeAnalyticsID = removeAnalyticsID;

class Analytics {
  /**
   * Creates analytics
   * @param {string} mixpanelToken
   */
  constructor(mixpanelToken) {
    this.enabledAnalytics = getAnalyticsEnabled() !== false;

    if (!this.enabledAnalytics || _constants.DISABLED_ANALYTICS_ENV) {
      // Analytics are disabled
      return;
    }
    /**
     * Generating clientID can sometimes take some time (few hundred ms)
     * also we don't want to slow down executions of any commands' cos of
     * analytics.
     * @type {Promise<string | null>}
     */


    this.clientID = new Promise((resolve, reject) => {
      try {
        this.mixpanel = Mixpanel.init(mixpanelToken);
        const currentlyStoredID = getAnalyticsClientID();

        if (!currentlyStoredID) {
          const clientID = generateUUID();
          resolve(clientID);
          setAnalyticsClientID(clientID);
        } else {
          resolve(currentlyStoredID);
        }
      } catch (e) {
        reject(null);
      }
    });
    this.version = _constants.CLI_VERSION; // We want to set person only once

    this.personSet = false;
  }

  async setPerson() {
    const clientID = await this.clientID;
    if (!clientID) return; // These values can be set only once per user

    this.mixpanel.people.set_once(clientID, {
      'First seen on version': this.version,
      'First seen on CLI package': _constants.CLI_PACKAGE_NAME,
      source: 'cli',
      $created: new Date().toISOString()
    });
    this.mixpanel.people.set(clientID, {
      'Last Version Used': this.version,
      'Last seen on CLI package': _constants.CLI_PACKAGE_NAME
    });
  }
  /**
   * Getting email requires API call based on API key. We would set this only
   * when we already have the email from different actions. There is no need
   * to slow other commands with API call. All users usually logs in sooner or
   * later
   * @param {string} email
   */


  async setEmail(email) {
    const clientID = await this.clientID;
    if (!clientID) return; // Create alias for email, this allows us to track the same user across
    // different computers (clientIDs)

    this.mixpanel.alias(email, clientID);
    this.mixpanel.people.set(clientID, {
      $email: email
    });
  }
  /**
   * This is set if we detect env variable CI true.
   * Because in these cases you are not logged in via email.
   *
   * @param {string} team
   * @param {string} site
   */


  async setCIAlias(team, site) {
    const clientID = await this.clientID;
    if (!clientID) return; // We can't use just site name as alias as multiple teams can have
    // the same site name. This way we are able to quickly and simply
    // group all events for single site.

    const aliasSlug = `${team}-${site}`;
    this.mixpanel.alias(aliasSlug, clientID);
    this.mixpanel.people.set(clientID, {
      'site-slug': aliasSlug,
      team: team,
      $name: aliasSlug
    });
  }
  /**
   * When analytics are disabled this command doesn't do anything as
   * clientID is not setup.
   * @param {string} eventName All events have automatically added cli_ prefix
   * @param {Object} [properties]
   */


  async trackEvent(eventName, properties) {
    const clientID = await this.clientID;
    if (!clientID) return; // We want to do this only once

    if (!this.personSet) {
      await this.setPerson();
      this.personSet = true;
    }

    this.mixpanel.track(`cli_${eventName}`, _objectSpread({}, properties, {}, {
      distinct_id: clientID,
      version: this.version,
      packageName: _constants.CLI_PACKAGE_NAME,
      $os: process.platform,
      ci: process.env.CI || false,
      source: 'cli'
    }));
  }

}

exports.Analytics = Analytics;