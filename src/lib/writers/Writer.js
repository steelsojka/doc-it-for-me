export default class Writer {
  constructor(options = {}) {
    this.options = options;
  }

  defaultWriter() {
    return '';
  }

  write(node, ...args) {
    if (typeof this[node.type] === 'function') {
      return this[node.type].call(this, node, ...args);
    }

    return this.defaultWriter(node, ...args);
  }
}
