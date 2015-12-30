import { parse } from 'babylon';
import ESTreeRunner from 'estree-runner';
import typeHandlers from './typeHandlers';
import defaults from 'lodash.defaults';

export default function docItForMe(sources, options = {}) {
  const runner = new ESTreeRunner();

  defaults(options, {
    paramTag: 'param',
    returnTag: 'returns',
    defaultParamType: '*',
    defaultReturnType: '*',
    paramDescription: name => `The ${name}.`,
    parseOptions: {}
  });

  defaults(options.parseOptions, {
    sourceType: 'module',
    plugins: [
      'decorators',
      'asyncFunctions'
    ]
  });

  sources = Array.isArray(sources) ? sources : [sources];

  return sources.map(source => {
    return annotate(parseSource(runner, source, options), source);
  });
}

function parseSource(runner, source, options = {}) {
  let results = {
    annotations: []
  };

  for (let node of runner.run(parse(source, options.parseOptions))) {
    if (typeHandlers.hasOwnProperty(node.type)) {
      let annotation = typeHandlers[node.type].call(this, node, node[runner.parentKey], options, runner);

      if (annotation !== false) {
        results.annotations.push(annotation);
      }
    }
  }

  return results;
}

function annotate(result, source) {
  let lineOffset = 0;
  let output = source.split('\n');

  for (let annotation of result.annotations) {
    let doc = annotation.annotation.map(line => padString(line, annotation.start.column));
    output.splice(annotation.start.line - 1 + lineOffset, 0, doc.join('\n'));
    lineOffset++;
  }

  result.annotatedSource = output.join('\n');

  console.log(result.annotatedSource);

  return result;
}

function padString(string, amount) {
  let result = '';

  for (let i = 0; i < amount; i++) {
    result += ' ';
  }

  return `${result}${string}`;
}
