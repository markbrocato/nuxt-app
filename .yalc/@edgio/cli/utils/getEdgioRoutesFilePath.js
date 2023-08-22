"use strict";

const {
  join
} = require('path');

const {
  existsSync
} = require('fs');

module.exports = function getEdgioRoutesFilePath() {
  const result = ['routes.js', 'routes.ts', 'routes.cjs'].find(file => existsSync(join(process.cwd(), file)));
  return result;
};