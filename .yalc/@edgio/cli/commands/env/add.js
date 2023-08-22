"use strict";

const EdgioPackageJson = require('../../utils/EdgioPackageJson');

const authenticate = require('../../prompts/authenticate');

const getEdgioConfig = require('../../utils/getEdgioConfig');

const brandify = require('../../utils/brandify');

const getSite = require('../../utils/getSite');

const {
  EOL
} = require('os');

const {
  green
} = require('chalk');

const Validator = require('../../utils/validator');

const deprecatedCommandWarning = require('../../prompts/deprecatedCommandWarning');

exports.command = 'add'; // This command is hidden until console team will be ready to support it
// exports.describe = 'Creates new environment with given name'

exports.builder = {
  environment: {
    type: 'string',
    alias: 'e',
    describe: 'The name of the environment.',
    demandOption: true
  },
  'copy-environment': {
    type: 'string',
    describe: 'The name of the environment you want to copy settings from.'
  },
  production: {
    type: 'boolean',
    describe: 'Changes the production environment to this environment.',
    default: false
  },
  'can-members-deploy': {
    type: 'boolean',
    describe: 'Allows all team members to deploy to this environment.',
    default: false
  },
  site: {
    type: 'string',
    alias: 's',
    describe: 'Slug of the property. Using package.json environment property if omitted.',
    deprecated: "Use '--property' instead. Will be deprecated in next major version."
  },
  property: {
    type: 'string',
    describe: 'Slug of the property. Using package.json environment property if omitted.'
  },
  team: {
    type: 'string',
    alias: 't',
    describe: 'The environment of the team under which the site belongs. Using private space if omitted.'
  },
  path: {
    type: 'string',
    describe: "Path to your site's root directory. Uses current directory by default.",
    default: '.'
  }
};

exports.handler = async yargs => {
  var _addResult$createEnvi;

  const {
    context,
    environment: environmentParam,
    site: siteSlugParam,
    property: propertySlugParam,
    team: teamSlugParam,
    path: pathParam,
    production: productionParam,
    canMembersDeploy: canMembersDeployParam,
    copyEnvironment: copyEnvironmentParam
  } = yargs;

  if (siteSlugParam) {
    deprecatedCommandWarning(context, 'site', 'property');
  }

  let localPropertyParam = propertySlugParam || siteSlugParam;
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
  const siteSlug = validator.validateSiteName(localPropertyParam || config.name || packageJson.name);
  const teamSlug = teamSlugParam || config.team;
  context.logger.warn('WARNING: Experimental feature - compatibility and support is not guaranteed (APPOPS-15456).');
  await context.logger.title('⌛ Creating environment...');
  const environmentDetails = [`> team=${teamSlug || 'Private space'}`, `> site=${siteSlug}`, `> environment=${environmentParam}`, `> production=${productionParam}`, `> canMembersDeploy=${canMembersDeployParam}`].filter(Boolean); // Removes falsy values

  if (copyEnvironmentParam) {
    environmentDetails.push(`> copyEnvironment=${copyEnvironmentParam}`);
  }

  context.logger.info(environmentDetails.join(EOL));
  let site = await getSite(context, siteSlug, teamSlug);
  const addResult = await context.api.createEnvironment({
    siteId: site.id,
    name: environmentParam,
    production: productionParam,
    canMembersDeploy: canMembersDeployParam,
    copyEnvironment: copyEnvironmentParam
  });
  const errors = (_addResult$createEnvi = addResult.createEnvironment) === null || _addResult$createEnvi === void 0 ? void 0 : _addResult$createEnvi.userErrors;

  if (errors && errors.length === 0) {
    var _addResult$createEnvi2;

    let envUrl = `http://${(_addResult$createEnvi2 = addResult.createEnvironment) === null || _addResult$createEnvi2 === void 0 ? void 0 : _addResult$createEnvi2.environment.defaultDomainName}`;
    context.logger.info(green(`Environment "${environmentParam}" was successfully created.${EOL}${brandify('Edge')}:${EOL}${envUrl}`));
    process.exit(0);
  }

  if (errors && errors[0].message === 'has already been taken') {
    context.logger.error(`Error: Environment "${environmentParam}" already exists.`);
    process.exit(1);
  }

  if (errors && errors.length > 0) {
    errors.forEach(error => {
      context.logger.error(`Error: ${error.message}.`);
    });
    process.exit(1);
  }

  context.logger.error(`Error: Unknown error. Couldn't create environment.`);
  process.exit(1);
};