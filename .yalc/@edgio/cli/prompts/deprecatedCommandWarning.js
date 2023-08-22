"use strict";

/**
 * The yargs can't show warning when you use the deprecated command.
 * It shows only in the help command.
 * @param context
 * @param oldCommand
 * @param newCommand
 */
const deprecatedCommandWarning = (context, oldCommand, newCommand) => {
  const {
    logger
  } = context;
  oldCommand = oldCommand.startsWith('--') ? oldCommand : `--${oldCommand}`;
  newCommand = newCommand.startsWith('--') ? newCommand : `--${newCommand}`;
  logger.warn('⚠️', ` WARNING: "${oldCommand}" option is deprecated. Please use "${newCommand}" instead.`);
};

module.exports = deprecatedCommandWarning;