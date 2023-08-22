"use strict";

const authenticate = require('../prompts/authenticate');

exports.command = 'whoami';
exports.describe = 'Outputs the email address associated with the logged in user';
exports.builder = {};

exports.handler = async ({
  context
}) => {
  const {
    analytics
  } = context;
  const promiseTracked = analytics.trackEvent('whoami');
  await authenticate(context);
  await promiseTracked;
};