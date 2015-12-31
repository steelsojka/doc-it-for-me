import isString from 'lodash.isstring';

export default class Annotation {
  constructor(config = {}) {
    Object.assign(this, {
      value: isString(config.value) ? config.value.split('\n') : config.value,
      line: config.line,
      column: config.column,
      insertLength: config.insertLength || 0
    });
  }

  static is(annotation) {
    return annotation instanceof Annotation;
  }
}
