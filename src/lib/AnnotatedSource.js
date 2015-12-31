export default class AnnotatedSource {
  constructor(config = {}) {
    Object.assign(this, {
      source: config.source,
      value: config.value,
      annotations: config.annotations
    });
  }
}
