"use strict";

const os = require('os');

const authenticationStatus = async context => {
  const {
    apiKey,
    currentActor,
    logger
  } = context;

  if (currentActor) {
    if (currentActor.deployToken) {
      logger.success(`🔑 Logged in as "${currentActor.name}" deploy token of site "${currentActor.deployToken.site.slug}".${os.EOL}`);
    } else {
      logger.success(`🔑 Logged in as "${currentActor.name}".${os.EOL}`);
    }

    return true;
  }

  if (apiKey) {
    logger.error(`🔑 Incorrect apiKey.${os.EOL}`);
  } else {
    logger.warn(`🔑 You are not logged in.${os.EOL}`);
  }

  return false;
};

module.exports = authenticationStatus;