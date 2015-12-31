import Writer from './Writer';
import JSDocParamWriter from './JSDocParamWriter';
import Annotation from '../Annotation';
import defaults from 'lodash.defaults';
import JSDocBlockWriter from './JSDocBlockWriter';
import path from 'path';

export default class JSDocWriter extends Writer {
  constructor(options) {
    super(options);

    defaults(this.options, {
      returnTag: 'returns',
      defaultReturnType: '*',
      voidReturnTypes: false,
      overwriteDocs: false,
      excludedMethods: [],
      privateMethodMatcher: /^_/,
      rootModulePath: process.cwd(),
      includeModuleTag: false
    });

    this.exportNodeTypes = [
      'ExportDefaultDeclaration', 
      'ExportNamedDeclaration'
    ];

    this.paramWriter = new JSDocParamWriter(options);
  }

  Program(node, parentNode, source) {
    if (node.sourceType !== 'module' || !source.path || !this.options.includeModuleTag) {
      return;
    }

    let block = new JSDocBlockWriter(this.options);
    let modulePath = path.parse(source.path);

    block.writeTag('module', path.join(modulePath.dir, modulePath.name), true);
    block.close();

    return new Annotation({
      value: block.inline(),
      line: node.loc.start.line,
      column: node.loc.start.column
    });
  }

  FunctionDeclaration(node, parentNode) {
    let block = new JSDocBlockWriter(this.options);
    let startLineResults = this.getStartLine(node);

    if (!startLineResults) {
      return;
    }

    let { startLine, insertLength } = startLineResults;
    let column = this.getStartColumn(node, parentNode);

    block.writeLine(`The ${node.id.name} function.`);

    if (this.options.privateMethodMatcher 
        && this.options.privateMethodMatcher.test(node.id.name)) {

      block.writeTag('private');
    }

    for (let param of node.params) {
      block.writeLine(this.paramWriter.write(param), true);
    }

    this.writeReturnStatement(block, node);

    block.close();

    return new Annotation({
      insertLength,
      column,
      value: block.join(),
      line: startLine
    });
  }

  ClassDeclaration(node, parentNode) {
    let block = new JSDocBlockWriter(this.options);
    let startLineResults = this.getStartLine(node);

    if (!startLineResults) {
      return;
    }

    let { startLine, insertLength } = startLineResults;
    let column = this.getStartColumn(node, parentNode);

    block.writeLine(`The ${node.id.name} class.`);

    if (node.superClass) {
      block.writeTag('extends', `${node.superClass.name}`);
    }

    block.close();

    return new Annotation({
      insertLength,
      column,
      value: block.join(),
      line: startLine
    });
  }

  ClassMethod(node, parentNode) {
    if (this.options.excludedMethods.indexOf(node.key.name) !== -1) {
      return;
    }

    let block = new JSDocBlockWriter(this.options);
    let startLineResults = this.getStartLine(node);

    if (!startLineResults) {
      return;
    }

    let { startLine, insertLength } = startLineResults;
    let column = this.getStartColumn(node, parentNode);

    block.writeLine(`The ${node.key.name} method.`);

    if (node.static) {
      block.writeTag('static');
    }

    if (this.options.privateMethodMatcher 
        && this.options.privateMethodMatcher.test(node.key.name)) {

      block.writeTag('private');
    }

    for (let param of node.params) {
      block.writeLine(this.paramWriter.write(param), true);
    }

    this.writeReturnStatement(block, node);

    block.close();

    return new Annotation({
      insertLength,
      column,
      value: block.join(),
      line: startLine
    });
  }

  getStartLine(node) {
    let currentBlockNode = node.leadingComments ? node.leadingComments.find(node => node.type === 'CommentBlock') : null;
    let insertLength = 0;
    let startLine = node.loc.start.line;

    if (currentBlockNode) {
      if (this.options.overwriteDocs) {
        startLine = currentBlockNode.loc.start.line;
        insertLength = currentBlockNode.loc.end.line - startLine + 1;
      } else {
        return null;
      }
    } else if (node.decorators && node.decorators.length) {
      startLine = node.decorators[0].loc.start.line;
    }

    return { startLine, insertLength };
  }

  getStartColumn(node, parentNode) {
    if (parentNode && this.exportNodeTypes.indexOf(parentNode.type) !== -1) {
      return parentNode.loc.start.column;
    }

    return node.loc.start.column;
  }

  writeReturnStatement(block, node) {
    let returnNode = node.body.body.find(node => node.type === 'ReturnStatement');

    if (returnNode) {
      block.writeLine(`@${this.options.returnTag} {${this.options.defaultReturnType}} The result.`);
    } else if (this.options.voidReturnTypes) {
      block.writeLine(`@${this.options.returnTag} {void}`);
    }
  }
}
