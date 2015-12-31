import Writer from './Writer';

export default class JSDocBlock extends Writer {
  constructor(options = {}) {
    super(options);

    this.block = ['/**'];
  }

  writeLine(msg, inline = false) {
    this.block.push(`${inline ? ' ' : ' * '}${msg}`);
  }

  writeTag(tag, desc = '', inline = false) {
    this.block.push(`${inline ? ' ' : ' * '}@${tag}${desc ? ' ' + desc : ''}`)
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
}
