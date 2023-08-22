"use strict";

const EdgioPackageJson = require('../../utils/EdgioPackageJson');

const authenticate = require('../../prompts/authenticate');

const getEdgioConfig = require('../../utils/getEdgioConfig');

const getSite = require('../../utils/getSite');

const {
  EOL
} = require('os');

const Validator = require('../../utils/validator');

const deprecatedCommandWarning = require('../../prompts/deprecatedCommandWarning');

exports.command = 'list'; // This command is hidden until console team will be ready to support it
// exports.describe = "Prints the list of site's environments"

exports.builder = {
  site: {
    type: 'string',
    alias: 's',
    describe: 'Slug of the site. Using package.json name property if omitted.',
    deprecated: "Use '--property' instead. Will be deprecated in next major version."
  },
  property: {
    type: 'string',
    describe: 'Slug of the property. Using package.json name property by default.'
  },
  team: {
    type: 'string',
    alias: 't',
    describe: 'The name of the team under which the site belongs. Using private space if omitted.'
  },
  path: {
    type: 'string',
    describe: "Path to your site's root directory. Uses current directory by default.",
    default: '.'
  }
};

exports.handler = async yargs => {
  const {
    context,
    site: siteSlugParam,
    property,
    team: teamSlugParam,
    path: pathParam
  } = yargs;

  if (siteSlugParam) {
    deprecatedCommandWarning(context, 'site', 'property');
  }

  let localPropertySlugParam = property || siteSlugParam;
  await authenticate(context);
  const config = getEdgioConfig();

  if (!config) {
    context.logger.error(`Error: edgio.config.js not found. Please run "0 init" to initialize your Edgio project.\n`);
    process.exit(1);
  }

  const validator = new Validator(context.logger, {
    exitOnError: true
  });
  const packageJson = EdgioPackageJson.loadPackageJson(pathParam);
  const siteSlug = validator.validateSiteName(localPropertySlugParam || config.name || packageJson.name);
  const teamSlug = teamSlugParam || config.team;
  context.logger.warn('WARNING: Experimental feature - compatibility and support is not guaranteed (APPOPS-15456).');
  await context.logger.title('⌛ Loading environments...');
  const environmentDetails = [`> team=${teamSlug || 'Private space'}`, `> site=${siteSlug}${EOL}`].filter(Boolean); // Removes falsy values

  context.logger.info(environmentDetails.join(EOL));
  let site = await getSite(context, siteSlug, teamSlug);
  let environments = site.environments.nodes;
  await context.logger.title('Environments:');
  environments.forEach(environment => {
    context.logger.info(`${environment.name}`);
  });
};