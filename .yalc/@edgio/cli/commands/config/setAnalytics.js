"use strict";

const {
  enableAnalytics,
  disableAnalytics
} = require('../../utils/analytics');

exports.command = 'set-analytics <option>';
exports.describe = 'Enables or disables the analytics. Set false or true.';
exports.builder = {};

exports.handler = async yargs => {
  const {
    context: {
      logger
    },
    option
  } = yargs;

  if (option === 'true') {
    enableAnalytics();
    logger.info('Analytics has been enabled');
  } else if (option === 'false') {
    disableAnalytics();
    logger.info('Analytics has been disabled');
  } else {
    logger.info('Analytics settings was not changed. Please set true or false.');
  }
};