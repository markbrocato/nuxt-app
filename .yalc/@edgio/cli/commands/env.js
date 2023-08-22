"use strict";

exports.command = 'env';
exports.describe = 'Allows to manage property environments and perform actions with them';

exports.builder = yargs => yargs.commandDir('env').demandCommand();