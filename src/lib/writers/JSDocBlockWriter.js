import Writer from './Writer';

export default class JSDocBlockWriter extends Writer {
  constructor(options = {}) {
    super(options);

    this.block = ['/**'];
  }

  writeLine(msg, inline = false) {
    this.block.push(JSDocBlockWriter.createLine(msg, inline));
  }

  writeTag(tag, desc = '', inline = false) {
    this.block.push(JSDocBlockWriter.createTag(tag, desc, inline));
  }

  close() {
    this.block.push(` */`);
  }

  inline() {
    return this.block.join(' ');
  }

  join() {
    return this.block.join('\n')
  }

  static createLine(msg, inline = false) {
    return `${inline ? '' : ' * '}${msg}`;
  }

  static createTag(tag, desc = '', inline = false) {
    return `${inline ? '' : ' * '}@${tag}${desc ? ' ' + desc : ''}`;
  }
}
