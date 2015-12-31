import Writer from './Writer';

export default class LiteralWriter extends Writer {
  NullLiteral() {
    return 'null';
  }

  NumericLiteral(node) {
    return node.value;
  }

  StringLiteral(node) {
    return `'${node.value}'`;
  }

  ArrayExpression(node) {
    return `[${node.elements.map(this.write.bind(this))}]`;
  }

  ObjectExpression(node) {
    return `{${node.properties.map(this.write.bind(this)).join(', ')}}`;
  }

  ObjectProperty(node) {
    return node.shorthand ? node.key.name : `${node.key.name}: ${this.write(node.value)}`;
  }
}
