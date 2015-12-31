export default class Source {
  constructor(config = {}) {
    Object.assign(this, {
      raw: config.raw,
      ast: config.ast,
      path: config.path
    });
  }
}
