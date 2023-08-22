"use strict";

const loginPrompt = require('../prompts/login');

const {
  analyticsInfoMessage
} = require('../utils/analytics');

exports.command = 'login';
exports.describe = 'Logs you into Edgio';
exports.builder = {};

exports.handler = async ({
  context
}) => {
  const {
    analytics,
    logger
  } = context;
  const promiseTracked = analytics.trackEvent('login');
  logger.info(analyticsInfoMessage);
  await loginPrompt(context);
  await promiseTracked;
};