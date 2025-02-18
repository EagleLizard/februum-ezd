
import path from 'path';
import fs from 'fs';

import * as commonmark from 'commonmark';

import { DATA_DIR_PATH } from '../constants';
import { ElToken } from '../el/el-token';

export async function md() {
  let test1FilePath = [
    DATA_DIR_PATH,
    'md',
    // 'test1.md',
    'test2.md',
  ].join(path.sep);
  let fileData = fs.readFileSync(test1FilePath).toString();
  let mdr = new commonmark.Parser();
  let parsed = mdr.parse(fileData);
  traverse3(parsed);
  let htmlr = new commonmark.HtmlRenderer();
  let htmlStr = htmlr.render(parsed);
  console.log(htmlStr);
}

function traverse3(cmNode: commonmark.Node) {
  let walker: commonmark.NodeWalker = cmNode.walker();
  let currNodeStep: commonmark.NodeWalkingStep | null;
  while((currNodeStep = walker.next()) !== null) {
    let currNode = currNodeStep.node;
    let nodeStr = `${currNode.type}${(currNode.literal !== null) ? ` - ${currNode.literal}` : ''}`;
    console.log(nodeStr);
  }

  let elStack: ElToken[] = [];
  function helper(currNode: commonmark.Node | null) {
    if(currNode === null) {
      return;
    }
    let currEl = nodeToEl(currNode);
    pushNode(currEl);
    helper(currNode.firstChild);
    helper(currNode.next);
    popNode(currEl);
  }
  function popNode(currEl: ElToken) {
    let elem: ElToken | undefined;
    let innerEls: ElToken[] = [];
    switch(currEl.type) {
      case 'block':
        /* 
          consume/aggregate tokens on top of currEl in the stack
        _*/
        while(((elem = elStack.pop()) !== undefined)) {
          if(elem.id === currEl.id) {
            break;
          } else {
            innerEls.push(elem);
          }
        }
        break;
    }
    if(innerEls.length > 0) {
      /*
        prefix/wrap the resulting token value with the appropriate
          markup
      _*/
      let termOpen = currEl.tag() ?? '';
      let termClose = currEl.tag(true) ?? '';
      let innerTxt = '';
      let innerTxtVals: string[] = [];
      while(innerEls.length > 0) {
        let innerEl = innerEls.pop()!;
        /*
          expect all inner tokens to be type 'text' | 'term'
        _*/
        if(innerEl.type !== 'text' && innerEl.type !== 'term') {
          throw new Error(`Unexpected inner element type: ${innerEl.type}, val: ${innerEl.val}`);
        }
        if(innerEl.val !== undefined) {
          innerTxtVals.push(innerEl.val);
        }
      }
      innerTxt = innerTxtVals.join('');
      let hasNewline = (
        (currEl.nodeType === 'paragraph')
        || (currEl.nodeType === 'heading')
        || (currEl.nodeType === 'block_quote')
      );
      let termPre = hasNewline ? '\n' : '';
      let termVal = `${termPre}${termOpen}${innerTxt}${termClose}`;
      let termEl = new ElToken({
        type: 'term',
        val: termVal,
        nodeType: 'term',
      });
      elStack.push(termEl);
    }
  }
  function nodeToEl(currNode: commonmark.Node): ElToken {
    let el: ElToken | undefined;
    switch(currNode.type) {
      case 'text':
      case 'code':
      case 'code_block':
        if(currNode.literal === null) {
          throw new Error(`unexpected empty text in node: ${currNode.type}`);
        }
        el = new ElToken({
          type: 'text',
          val: currNode.literal,
          nodeType: currNode.type,
        });
        break;
      case 'heading':
        el = new ElToken({
          type: 'block',
          nodeType: currNode.type,
          level: currNode.level,
        });
        break;
      case 'paragraph':
        el = new ElToken({
          type: 'block',
          nodeType: currNode.type,
        });
        break;
      case 'strong':
        el = new ElToken({
          type: 'block',
          nodeType: currNode.type,
        });
        break;
      case 'emph':
        el = new ElToken({
          type: 'block',
          nodeType: currNode.type,
        });
        break;
      case 'block_quote':
        el = new ElToken({
          type: 'block',
          nodeType: currNode.type,
        });
        break;
      case 'document':
        el = new ElToken({
          type: 'block',
          nodeType: currNode.type,
        });
        break;
      default:
        throw new Error(`no ElToken for type: ${currNode.type}`);
    }
    if(el === undefined) {
      throw new Error(`No ElToken created for node: ${currNode.type}`);
    }
    return el;
  }
  function pushNode(el: ElToken) {
    elStack.push(el);
  }
  
  helper(cmNode);
  console.log('elStack');
  console.log(elStack);
}
