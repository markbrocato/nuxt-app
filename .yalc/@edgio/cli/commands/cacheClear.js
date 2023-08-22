"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const authenticate = require('../prompts/authenticate');

const EdgioPackageJson = require('../utils/EdgioPackageJson');

const Validator = require('../utils/validator');

const deprecatedCommandWarning = require('../prompts/deprecatedCommandWarning');

exports.command = 'cache-clear [options]';
exports.describe = 'Purges responses from the edge cache for a specific environment';

exports.builder = yargs => {
  yargs.usage('$0 cache-clear [options]').example('$0 cache-clear --team=team-name --property=property-name --environment=environment-name --path=/products/1', 'Clear "/products/1" for "property-name" project under user\'s personal team').example('$0 cache-clear --team=team-name --property=property-name --environment=environment-name --path=/products/*', 'Clear all urls on the domains in this project under "team-name" team that match the prefix "/products"').example('$0 cache-clear --team=team-name --property=property-name --environment=environment-name --surrogate-key=key', 'Clear all domains in this project under user\'s personal team that have the surrogate key "key"').describe('team', 'Slug of the team where the site belongs. Using your personal team by default').describe('site', 'Slug of the site whose cache should be cleared. If omitted, the site name will automatically be derived from the name field in package.json.').describe('property', 'Slug of the property whose cache should be cleared. If omitted, the site name will automatically be derived from the name field in package.json.').describe('path', 'A path to clear. Use "*" as a wildcard.').describe('surrogate-key', 'Clears all responses assigned to the specified surrogate key.').describe('environment', 'The name of the environment whose cache should be cleared.').nargs('surrogate-key', 1).string('surrogate-key').alias('s', 'surrogate-key').nargs('path', 1).string('path').alias('p', 'path') // Arguments pattern and surrogate-key are mutually exclusive
  .conflicts('path', 'surrogate-key');
};

exports.handler = async (_ref) => {
  let {
    context
  } = _ref,
      yargs = _objectWithoutProperties(_ref, ["context"]);

  context.setLoginAction('cacheClear');
  await authenticate(context);
  const {
    logger,
    analytics
  } = context;
  const {
    team: teamSlug,
    site,
    property,
    path,
    surrogateKey,
    environment: environmentName
  } = yargs;

  if (site) {
    deprecatedCommandWarning(context, 'site', 'property');
  }

  let localProperty = property || site; // We don't track any other values as those are personal

  const promiseTracked = analytics.trackEvent('cache-clear');
  const validator = new Validator(logger, {
    exitOnError: true
  });
  let siteSlug = validator.validateSiteName(localProperty);

  if (!localProperty) {
    // If site slug was not provided, use the name in package.json
    // Check that package.json is existing or fail the deployment
    try {
      const packageJson = EdgioPackageJson.loadPackageJson(process.cwd());
      siteSlug = validator.validateSiteName(packageJson.name);
    } catch (e) {
      logger.error(e.message, {
        bold: true
      });
      process.exit(1);
    }
  }

  await logger.step('📡️ Purging the cache...', async () => {
    return await context.api.purgeCache({
      teamSlug,
      siteSlug,
      path,
      surrogateKey,
      environmentName
    });
  });
  logger.success('🚀 Cache has been successfully purged.');
  await promiseTracked;
};