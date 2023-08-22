"use strict";

const {
  join
} = require('path');

const {
  existsSync,
  createWriteStream
} = require('fs');

module.exports = function addIgnore() {
  // Add `.edgio` to the gitignore file
  const ignorePath = join(process.cwd(), '.gitignore');

  if (existsSync(ignorePath)) {
    const stream = createWriteStream(ignorePath, {
      flags: 'a'
    });
    stream.write('\n# Edgio generated build directory\n.edgio\n');
    stream.end();
  }
};