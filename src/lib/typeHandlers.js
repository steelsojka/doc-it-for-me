import writeLiteral from './writeLiteral';

export default {
  ClassMethod(node, parentNode, options) {
    let annotation = [
      '/**',
      ` * The ${node.key.name} method`
    ];

    if (node.static) {
      annotation.push(' * @static');
    }

    for (let param of node.params) {
      annotation.push(writeParam(param, options));
    }

    let returnNode = node.body.body.find(node => node.type === 'ReturnStatement');

    if (returnNode) {
      annotation.push(` * @${options.returnTag} {${options.defaultReturnType}} The result.`);
    }

    annotation.push(' */');

    return {
      annotation,
      start: node.loc.start
    };
  }
};

export function writeParam(node, options, meta = {}) {
  let result = ` * @${options.paramTag} `;

  switch (node.type) {
    case 'RestElement':
      result += `{...${options.defaultParamType}} ${node.argument.name} - ${options.paramDescriptio(node.argument.name)}`;
      break;
    case 'AssignmentPattern':
      result += `{${options.defaultParamType}} [${node.left.name}=${writeLiteral(node.right)}] - ${options.paramDescription(node.left.name)}.`;
      break;
    case 'ObjectPattern':
      if (!meta.path) {
        meta.path = 'object';
      }

      result += `{Object} ${meta.path} - ${options.paramDescription('object')}`;

      for (let property of node.properties) {
        result += `\n${writeParam(property, options, meta)}`
      }

      break;
    case 'ObjectProperty':
      if (node.value.type === 'ObjectPattern') {
        meta.path = `${meta.path}.${node.key.name}`;
        result = writeParam(node.value, meta);
      } else {
        result += `{${options.defaultParamType}} ${meta.path}.${node.key.name} - ${options.paramDescriptio(node.key.name)}`;
      }

      break;
    default:
      result += `{${options.defaultParamType}} ${node.name} - ${options.paramDescription(node.name)}.`;
  }

  return result;
}
