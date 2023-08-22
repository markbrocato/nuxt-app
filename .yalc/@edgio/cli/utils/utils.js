"use strict";

/**
 * Internal copy of https://www.npmjs.com/package/slash
 *  1# We don't need to rely on package which is 4 lines of code
 *  2# We can't update to the new version of package because of the imports...
 * @param path
 * @return {*}
 */
const slash = path => {
  const isExtendedLengthPath = path.startsWith('\\\\?\\');

  if (isExtendedLengthPath) {
    return path;
  }

  return path.replace(/\\/g, '/');
};

module.exports = {
  slash
};