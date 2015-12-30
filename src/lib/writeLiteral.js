export default function writeLiteral(node) {
  switch (node.type) {
    case 'NullLiteral': return 'null';
    case 'NumericLiteral': return node.value;
    case 'StringLiteral': return `'${node.value}'`;
    case 'ArrayExpression': return `[${node.elements.map(writeLiteral)}]`;
    case 'ObjectExpression': return `{${node.properties.map(writeLiteral).join(', ')}}`;
  }
}

export function writeObjectProperty(node) {
  return node.shorthand 
    ? `${node.key.name}: ${writeLiteral(node.value)}`
    : `${node.key.name}`;
}
