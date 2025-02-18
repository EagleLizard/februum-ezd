
import path from 'path';
import fs from 'fs';

import * as commonmark from 'commonmark';

import { DATA_DIR_PATH } from '../constants';
import { ElToken } from '../el/el-token';
import assert from 'assert';

export async function md() {
  let test1FilePath = [
    DATA_DIR_PATH,
    'md',
    // 'test1.md',
    'test2.md',
    // 'test3_p.md',
  ].join(path.sep);
  let fileData = fs.readFileSync(test1FilePath).toString();
  let mdr = new commonmark.Parser();
  let parsed = mdr.parse(fileData);
  let htmlStr = transformToHtml(parsed);
  console.log({ htmlStr });
  let htmlr = new commonmark.HtmlRenderer();
  let htmlStr2 = htmlr.render(parsed);
  console.log({ htmlStr2 });
}

function transformToHtml(cmNode: commonmark.Node) {
  let elStack: ElToken[] = [];
  function helper(currNode: commonmark.Node | null) {
    if(currNode === null) {
      return;
    }
    let currEl = nodeToEl(currNode);
    pushNode(currEl);
    helper(currNode.firstChild);
    popNode(currEl);
    helper(currNode.next);
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
      let termNl = hasNewline ? '\n' : '';
      let termVal = `${termOpen}${innerTxt}${termClose}${termNl}`;
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
      case 'strong':
      case 'emph':
      case 'block_quote':
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
  assert(elStack.length === 1);
  return elStack[0].val;
}
