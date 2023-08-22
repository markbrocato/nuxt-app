"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const detectFramework = require('../frameworks/detectFramework');

const {
  installDependencies,
  installCLIGlobally,
  isCLIInstalledGlobally,
  globalCLIInstallCommand,
  isYarnInstalled
} = require('./packageManager');

const addIgnore = require('./addIgnore');

const get = require('lodash/get');

const resolveInPackage = require('./resolveInPackage');

const logo = require('./logo');

const isPackageInstalled = require('../frameworks/isPackageInstalled');

const {
  isMonorepo,
  getAppsToInit
} = require('./monorepo');

const {
  cyan,
  bold
} = require('chalk');

const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} = require('fs');

const {
  join
} = require('path');

const prompts = require('prompts');

const {
  execSync
} = require('child_process');

const deployCommand = require('../commands/deploy').handler;

const setProperty = require('./config/setProperty');

const {
  slash
} = require('./utils');

const getEdgioConfigFilePath = require('./getEdgioConfigFilePath');

const setConfig = require('./config/setConfig');

const fs = require('fs');

const getEdgioRoutesFilePath = require('./getEdgioRoutesFilePath');

const {
  EOL
} = require('os');

const {
  DOCS_URL
} = require('../constants');

module.exports = async function init(args) {
  let {
    deploy,
    context: {
      logger
    }
  } = args;
  let appPaths;
  console.clear();
  logger.title(`🚀 Let's get started with ${logo}!\n`);

  if (isEdgioAlreadyAdded()) {
    logger.warn('This project already has edgio.config.js and routes.js files, skipping initialization.');
    return;
  }

  if (isMonorepo()) {
    logger.info(`It looks like you're using a ${cyan(bold('monorepo'))}.\n`);
    appPaths = (await getAppsToInit()) || appPaths;
  } else {
    appPaths = [process.cwd()];
  }

  for await (const appPath of appPaths) {
    process.chdir(appPath);
    await initializeApp(args);
  } // Install the Edgio CLI globally if it doesn't exist


  if (!isCLIInstalledGlobally()) {
    try {
      await installCLIGlobally();
    } catch (e) {
      logger.title(`\nPlease install the ${logo} CLI globally:\n`);
      console.log(cyan(`    ${globalCLIInstallCommand()}`));
    }
  }

  if (!deploy) {
    console.log('');
  }

  if (args.createDir) {
    logger.title(`To change directories to your new ${logo} app:\n`);
    console.log(cyan(`    cd ${args.dirName}\n`));
  }

  logger.title(`To run your app locally:\n`);
  console.log(cyan('    edg dev\n'));
  logger.title(`To ${deploy ? 're' : ''}deploy your app:\n`);
  console.log(cyan('    edg deploy\n'));
};

function isEdgioAlreadyAdded() {
  return getEdgioConfigFilePath() && getEdgioRoutesFilePath();
}
/**
 * Creates a node package in the current directory if the current directory is not already
 * a node package root
 */


async function ensureNodePackage(args) {
  let createNewApp = true;
  let nodePackageName = null;

  if (isNodePackageRoot()) {
    nodePackageName = getNodePackageName();
    const choices = await prompts([{
      type: 'select',
      name: 'createNewApp',
      message: 'The current directory contains a package.json file. How would you like to proceed?',
      choices: [{
        title: `Add Edgio to the current app${nodePackageName ? ` (${nodePackageName})` : ''}`,
        value: false
      }, {
        title: 'Create a new app',
        value: true
      }]
    }]);
    createNewApp = choices.createNewApp;

    if (createNewApp) {
      args.createDir = true;
    }
  } // We notify user if he defines args that won't be taken into consideration due to config update skip.


  const definedConfigArgs = [args.name && 'name', args.team && 'team', args.origin && 'origin'].filter(item => item);

  if (args.skipConfigUpdate && definedConfigArgs.length > 0) {
    const argsName = `argument${definedConfigArgs.length === 1 ? '' : 's'}`;
    let prettyArgVals = JSON.stringify(definedConfigArgs);
    prettyArgVals = prettyArgVals // removing brackets
    .substring(1, prettyArgVals.length - 1) // replacing double quotes for singles
    .replace(/"/g, "'") // padding commas
    .split(',').join(', ');
    console.log(`${logo} configuration (edgio.config.js) already exists - ${argsName} ${prettyArgVals} will not affect the initialization.`);
  }

  if (!args.name) {
    args.name = nodePackageName;
  }

  if (!args.name) {
    Object.assign(args, (await prompts([{
      name: 'name',
      type: 'text',
      message: `Enter a name for your app`
    }])));
  }

  if (!args.origin && !args.skipConfigUpdate) {
    Object.assign(args, (await prompts([{
      type: 'text',
      name: 'origin',
      message: `What is the hostname or IP address of the origin site that you will host on ${logo}?`,
      initial: 'example.com'
    }])));
    args.origin = args.origin.replace(/^https?:\/\//, '');
  }

  if (createNewApp) {
    args.dirName = args.dirName || args.name;

    if (args.createDir == null) {
      Object.assign(args, (await prompts([{
        name: 'createDir',
        message: `Should we create a new directory for your ${logo} app or use the current directory?`,
        type: 'select',
        initial: 0,
        choices: [{
          title: 'Use the current directory',
          value: false
        }, {
          title: 'Create a new directory',
          value: true
        }]
      }])));
    }

    while (args.createDir && existsSync(join(process.cwd(), args.dirName))) {
      Object.assign(args, (await prompts([{
        name: 'dirName',
        type: 'text',
        message: `⚠️  A directory named "${args.dirName}" already exists. Enter the name of the directory to create.`
      }])));
    }

    if (!args.packageManager) {
      if (await isYarnInstalled()) {
        Object.assign(args, (await prompts([{
          type: 'select',
          name: 'packageManager',
          message: 'Which package manager would you like to use?',
          choices: [{
            title: 'npm',
            value: 'npm'
          }, {
            title: 'yarn',
            value: 'yarn'
          }],
          initial: 0
        }])));
      } else {
        args.packageManager = 'npm';
      }
    }

    if (args.packageManager === 'yarn') {
      // packageManager.js will recognize this and use yarn from now on
      process.env.YARN = 'true';
    }

    if (args.createDir) {
      mkdirSync(args.dirName);
      process.chdir(args.dirName);
    }

    execSync(`${args.packageManager} init --yes`, {
      stdio: 'ignore'
    });
  }
}
/**
 * Initializes a new Edgio app in the current working directory
 * @param {*} args
 */


async function initializeApp(args) {
  let {
    connector,
    deploy,
    context: {
      logger
    }
  } = args;

  if (connector) {
    args.connector = {
      builder: connector
    };
  } else {
    args.connector = await detectFramework();
  }

  let nodejsConnectorConfig = undefined;

  if (args.connector === undefined) {
    nodejsConnectorConfig = await askForNodejsConnector(logger);

    if (nodejsConnectorConfig) {
      args.connector = {
        key: 'edgio-nodejs-connector',
        name: 'Edgio Node.js Connector',
        builder: '@edgio/nodejs-connector',
        devDependencies: ['@edgio/nodejs-connector'],
        framework: 'custom',
        frameworkVersion: undefined
      };
    }
  } // If edgio config was already present, we mustn't run the updateConfig again.


  args.skipConfigUpdate = fs.existsSync(getEdgioConfigFilePath());

  if (!args.connector) {
    await ensureNodePackage(args);
  }

  await installAllDependencies(args);
  addIgnore();
  await runInitScript(args);
  !args.skipConfigUpdate && (await updateConfig(args)); // If nodejs-connector is set, update the config with the custom connector settings
  // we do here, as we need to install dependencies first and add default config and
  // then update the config with the custom connector settings

  if (nodejsConnectorConfig) {
    setConfig(nodejsConnectorConfig);
  }

  if (deploy) {
    await deployCommand(_objectSpread({}, args, {
      path: '.'
    }));
  }
}
/**
 * Installs all Edgio build and runtime dependencies
 */


async function installAllDependencies({
  context: {
    logger
  },
  connector,
  edgioVersion,
  skipEdgioDeps
}) {
  // add @edgio/* as build time dependencies
  const devDependencies = {
    '@edgio/core': edgioVersion,
    '@edgio/cli': edgioVersion,
    '@edgio/prefetch': edgioVersion,
    '@edgio/devtools': edgioVersion
  };
  const dependencies = {};

  if (connector) {
    if (connector.name) {
      logger.info(`> Found framework ${cyan(bold(connector.name))}.\n`);
    }

    const addLib = (lib, depArray) => {
      const isEdgioLib = lib.startsWith('@edgio/') || lib.startsWith('@layer0/');

      if (isEdgioLib) {
        depArray[lib] = edgioVersion;
      } else {
        // match the name and the version of the library, defaulting to `latest` if no version specified
        // modified from https://stackoverflow.com/a/64880672
        const res = /(.+)@[~^]?([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*)/.exec(lib); // as we can ommit specifying the version, we need to check if the regex matched
        // if it didn't, we use the lib as the name and 'latest' as the version

        const [, name, version] = res ? res : [null, lib, 'latest'];
        depArray[name] = version || 'latest';
      }
    }; // add runtime dependencies


    if (connector.dependencies) {
      connector.dependencies.forEach(lib => addLib(lib, dependencies));
      await installDependencies(dependencies);
    }

    if (connector.devDependencies) {
      connector.devDependencies.forEach(lib => addLib(lib, devDependencies));
    } // install the connector if it's not already installed or a path to a local directory


    if (!connector.builder.startsWith('./') && !isPackageInstalled(connector.builder)) {
      devDependencies[connector.builder] = edgioVersion;
    }
  }

  await installDependencies(devDependencies, {
    dev: true,
    skipEdgioDeps
  });
}
/**
 * Runs the connector's init script, or the init script in @edgio/core if the connector
 * does not provide one.
 */


async function runInitScript({
  connector
}) {
  let initScript = require(resolveInPackage(get(connector, 'builder', '@edgio/core'), `init`)); // use default export if provided, otherwise use module.exports


  if (initScript.default) {
    initScript = initScript.default;
  }

  await initScript();
}
/**
 * Updates edgio.config.js based on:
 *
 * - name
 * - team
 * - origin
 *
 * Is expected NOT to be run on existing configurations - only newly copied.
 */


async function updateConfig({
  name,
  team,
  origin
}) {
  const configPath = getEdgioConfigFilePath();
  let source = readFileSync(configPath, 'utf8');

  if (name) {
    // this is far from ideal as the docs of the function suggest
    // as the name is no longer unique in v7, we use comments to denote where matching should start
    source = setProperty(source, 'name', name, {
      after: /\/\/ The name of the site/
    });
  }

  if (team) {
    source = setProperty(source, 'team', team);
  }

  if (origin) {
    source = setProperty(source, 'location', origin);
    source = setProperty(source, 'sni_hint_and_strict_san_check', origin);
    source = setProperty(source, 'override_host_header', origin);
  }

  writeFileSync(configPath, source, 'utf8');
}
/**
 * Returns true if the current directory is the root of a node package.
 */


function isNodePackageRoot() {
  return existsSync(join(process.cwd(), 'package.json'));
}
/**
 * Gets the name of the node package whose root is the current directory.
 * @returns
 */


function getNodePackageName() {
  return require(slash(join(process.cwd(), 'package.json'))).name;
}

const askForNodejsConnector = async logger => {
  logger.warn('WARNING: No framework detected. You can still use Edgio; however, we need more information about your project.');
  const customPrompt = await prompts([{
    type: 'select',
    name: 'res',
    message: 'What kind of project do you want to set up?',
    choices: [{
      title: 'Edgio Sites (Web-app hosting)',
      value: 'app'
    }, {
      title: 'Edgio Performance (CDN-as-code)',
      value: 'code'
    }],
    initial: 0
  }]);

  if (customPrompt.res === 'code') {
    return undefined;
  }

  logger.info(EOL, `The following prompts will help us configure your project using a Node.js connector.`, `If you don't know the answer to a question, you can press enter to skip it.`, `You can also update these settings later in ${cyan('edgio.config.js')}.`, EOL + EOL, `For more information, see ${cyan(`${DOCS_URL}/guides/sites_frameworks/getting_started/nodejs_connector`)}.`, EOL);
  const buildFolder = await prompts([{
    type: 'text',
    name: 'buildFolder',
    message: 'What is the build directory for server files of your app? (Leave blank if not applicable)'
  }]);
  const entryFile = await prompts([{
    type: 'text',
    name: 'entryFile',
    message: 'What is the path of the entry file (relative to the build directory) of your app? (Leave blank if not applicable)'
  }]);
  const staticFolder = await prompts([{
    type: 'text',
    name: 'staticFolder',
    message: 'What is the static files directory of your app? (Leave blank if not applicable)'
  }]);
  const envPort = await prompts([{
    type: 'text',
    name: 'envPort',
    message: 'What is the environment variable name for the port your app server listens to? (Leave blank if not applicable)'
  }]);
  const buildCommand = await prompts([{
    type: 'text',
    name: 'buildCommand',
    message: 'Please specify the build command (if available)'
  }]);
  const devCommand = await prompts([{
    type: 'text',
    name: 'devCommand',
    message: 'Please specify the dev server command (if available)'
  }]);
  const devReadyMessageOrTimeout = await prompts([{
    type: 'text',
    name: 'devReadyMessageOrTimeout',
    message: 'Please specify a message or timeout value (in seconds) to wait until the dev server is ready'
  }]); // change the underlaying type of dev ready message to number
  // if user specified a number

  const seconds = parseInt(devReadyMessageOrTimeout.devReadyMessageOrTimeout);

  if (!isNaN(seconds)) {
    devReadyMessageOrTimeout.devReadyMessageOrTimeout = seconds;
  }

  const nodejsConnectorConfig = {
    nodejsConnector: {
      buildFolder: buildFolder.buildFolder,
      entryFile: entryFile.entryFile,
      staticFolder: staticFolder.staticFolder,
      envPort: envPort.envPort,
      buildCommand: buildCommand.buildCommand,
      devCommand: devCommand.devCommand,
      devReadyMessageOrTimeout: devReadyMessageOrTimeout.devReadyMessageOrTimeout === '' ? 0 : devReadyMessageOrTimeout.devReadyMessageOrTimeout
    }
  };
  return nodejsConnectorConfig;
};