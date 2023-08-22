"use strict";

exports.command = 'logout';
exports.describe = 'Logs you out of Edgio';
exports.builder = {};

exports.handler = async ({
  context
}) => {
  const {
    analytics
  } = context;
  const promiseTracked = analytics.trackEvent('logout');
  await context.logout();
  await promiseTracked;
};