import Writer from './Writer';
import LiteralWriter from './LiteralWriter';
import defaults from 'lodash.defaults';

export default class JSDocParamWriter extends Writer {
  constructor(options) {
    super(options);

    defaults(options, {
      defaultParamType: '*',
      paramTag: 'param',
      paramDescription: name => `The ${name}`,
      objectPatternName: 'config'
    });

    this.literalWriter = new LiteralWriter(options);
  }

  RestElement(node) {
    return `${this.writeTag()} {...${this.options.defaultParamType}} ${node.argument.name} - ${this.options.paramDescription(node.argument.name)}`;
  }

  AssignmentPattern(node) {
    return `${this.writeTag()} {${this.options.defaultParamType}} [${node.left.name}=${this.literalWriter.write(node.right)}] - ${this.options.paramDescription(node.left.name)}.`;
  }

  ObjectPattern(node, meta = {}) {
    if (!meta.path) {
      meta.path = this.options.objectPatternName;
    }

    let result = `${this.writeTag()} {Object} ${meta.path} - ${options.paramDescription(this.options.objectPatternName)}`;

    for (let property of node.properties) {
      result += `\n${this.write(property, meta)}`;
    }

    return result;
  }

  ObjectProperty(node, meta = {}) {
    if (node.value.type === 'ObjectPattern') {
      meta.path = `${meta.path}.${node.key.name}`;
      return this.write(node.value, meta);
    } 

    return `${this.writeTag()} {${this.options.defaultParamType}} ${meta.path}.${node.key.name} - ${options.paramDescription(node.key.name)}`;
  }

  defaultWriter(node) {
    return `${this.writeTag()} {${this.options.defaultParamType}} ${node.name} - ${this.options.paramDescription(node.name)}.`;
  }

  writeTag(node) {
    return `@${this.options.paramTag}`;
  }
}
