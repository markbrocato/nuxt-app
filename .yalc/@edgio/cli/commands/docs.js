"use strict";

const open = require('open');

const {
  EOL
} = require('os');

const {
  DOCS_URL
} = require('../constants');

exports.command = 'docs';
exports.describe = 'Opens Edgio documentation in your browser';
exports.builder = {};

exports.handler = async ({
  context
}) => {
  const {
    analytics,
    logger
  } = context;
  const promiseTracked = analytics.trackEvent('docs');
  logger.info(`Opening documentation on url:${EOL}${DOCS_URL}`);
  open(DOCS_URL);
  await promiseTracked;
};