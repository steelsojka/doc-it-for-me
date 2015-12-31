import { parse } from 'babylon';
import ESTreeRunner from 'estree-runner';
import defaults from 'lodash.defaults';
import isFunction from 'lodash.isfunction';
import writers from './writers';
import Annotation from './Annotation';
import AnnotatedSource from './AnnotatedSource';
import Source from './Source';

export default function docItForMe(sources, options = {}) {
  const runner = new ESTreeRunner();

  defaults(options, {
    writer: 'JSDoc',
    parseOptions: {}
  });

  defaults(options.parseOptions, {
    sourceType: 'module',
    plugins: [
      'decorators',
      'asyncFunctions'
    ]
  });

  const Writer = getWriter(options.writer);

  sources = Array.isArray(sources) ? sources : [sources];

  return sources
    .map(source => source instanceof Source ? source : new Source({ raw: source }))
    .map(source => {
      return annotateSource(parseSource(runner, new Writer(options), source, options), source);
    });
}

function getWriter(writer, config) {
  if (isFunction(writer)) {
    return writer;
  } else if (writers.has(writer)) {
    return writers.get(writer);
  }

  throw new ReferenceError(`Writer ${writer} does not exist`);
}

function parseSource(runner, writer, source, options = {}) {
  let results = [];
  let ast = parse(source.raw, options.parseOptions);

  source.ast = ast;

  for (let node of runner.run(ast)) {
    let annotation = writer.write(node, node[runner.parentKey], source, runner);

    if (Annotation.is(annotation)) {
      results.push(annotation);
    }
  }

  return results;
}

function annotateSource(annotations, source) {
  let lineOffset = 0;
  let output = source.raw.split('\n');
  
  annotations.sort((a, b) => a.line - b.line);

  const result = new AnnotatedSource({ source, annotations });

  for (let annotation of annotations) {
    let doc = annotation.value.map(line => padString(line, annotation.column));

    output.splice(annotation.line - 1 + lineOffset, annotation.insertLength, doc.join('\n'));
    lineOffset += (1 - annotation.insertLength);
  }

  result.value = output.join('\n');

  // console.log(result.value);

  return result;
}

function padString(string, amount) {
  let result = '';

  for (let i = 0; i < amount; i++) {
    result += ' ';
  }

  return `${result}${string}`;
}
