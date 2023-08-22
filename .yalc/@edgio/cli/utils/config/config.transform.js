"use strict";

module.exports = (fileInfo, api, options) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const {
    config
  } = options; // find the export expression, and get the object that is being exported
  // the object should be in edgio config format, otherwise we don't know what to do
  // find: module.exports = { ... }

  const exportExpr = root.find(j.AssignmentExpression, node => {
    var _node$left, _node$left$object, _node$left2, _node$left2$property;

    return ((_node$left = node.left) === null || _node$left === void 0 ? void 0 : (_node$left$object = _node$left.object) === null || _node$left$object === void 0 ? void 0 : _node$left$object.name) === 'module' && ((_node$left2 = node.left) === null || _node$left2 === void 0 ? void 0 : (_node$left2$property = _node$left2.property) === null || _node$left2$property === void 0 ? void 0 : _node$left2$property.name) === 'exports';
  }).get().value.right;
  replaceProperties(j, exportExpr, config);
  return root.toSource();
}; // Recursively replace properties in an object expression
// with the properties of the target object


const replaceProperties = (j, objectExpression, targetObject) => {
  const props = Object.keys(targetObject).map(key => ({
    key,
    value: targetObject[key],
    type: typeof targetObject[key],
    prop: j(objectExpression).find(j.Property, n => n.key.name === key)
  })).filter(p => p.type !== 'function');
  props.forEach(({
    type,
    key,
    value,
    prop
  }) => {
    if (type === 'object') {
      if (prop.length > 0 && prop.get().value.type === 'ObjectExpression') {
        replaceProperties(j, prop.get(), value);
      } else {
        const newObj = j.property('init', j.identifier(key), j.objectExpression([]));
        if (prop.length > 0) prop.remove();
        objectExpression.properties.push(newObj);
        replaceProperties(j, newObj.value, value);
      }
    } else {
      const newObj = j.property('init', j.identifier(key), j.literal(value));

      if (prop.length > 0) {
        prop.get().value.value.value = value;
      } else {
        objectExpression.properties.push(newObj);
      }
    }
  });
};