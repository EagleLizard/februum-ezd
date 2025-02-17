
import path from 'path';
import fs from 'fs';

import * as commonmark from 'commonmark';

import { DATA_DIR_PATH } from '../constants';
import { ElToken } from '../el/el-token';

export async function md() {
  let test1FilePath = [
    DATA_DIR_PATH,
    'md',
    'test1.md',
  ].join(path.sep);
  // console.log(commonmark);
  // console.log('md');
  // console.log(test1FilePath);
  let fileData = fs.readFileSync(test1FilePath).toString();
  let mdr = new commonmark.Parser();
  let parsed = mdr.parse(fileData);
  // traverse(parsed);
  traverse2(parsed);
}

function traverse(cmNode: commonmark.Node) {
  function helper(currNode: commonmark.Node | null, soFar?: commonmark.Node[]) {
    soFar = soFar ?? [];
    if(currNode === null) {
      return;
    }
    let depth = soFar.length - 1;
    // console.log(`\n${currNode.type} - ${depth}`);
    if(currNode.type === 'text') {
      // console.log(currNode.literal);
    } else {
      let soFarStr = soFar.map(sfNode => sfNode.type).join(', ')
      console.log(`${soFarStr} - ${currNode.type}`)
    }
    switch(currNode.type) {
      case 'text':
        console.log(currNode.literal);
        break;
      case 'paragraph':
        console.log('<p>');
        soFar.pop();
        break;
    }
    soFar = [ ...soFar, currNode ];
    helper(currNode.firstChild, soFar);
    helper(currNode.next, soFar);
    soFar.pop();
  } 
  helper(cmNode);
}

function traverse2(cmNode: commonmark.Node) {
  let soFar: commonmark.Node[] = [];
  let elStack: ElToken[] = [];
  let res: string[] = [];

  function helper(currNode: commonmark.Node | null) {
    // soFar = soFar ?? [];
    if(currNode === null) {
      return;
    }
    soFar.push(currNode);
    // soFar = [ ...soFar, currNode ];
    let soFarStr = soFar.map(sfNode => sfNode.type).join(', ');
    let currNodeStr = `${soFarStr}${currNode.literal === null ? '' : ` - ${currNode.literal}`}`;
    // console.log(currNodeStr);
    visit(currNode, soFar);
    helper(currNode.firstChild);
    popToken();
    helper(currNode.next);
  }

  function visit(currNode: commonmark.Node, nodesSoFar: commonmark.Node[]) {
    let elToken: ElToken | undefined;
    switch(currNode.type) {
      case 'text':
        // console.log(`${soFarTypeStr} [${currNode.type}] - ${currNode.literal}`);
        // console.log(getSoFarNodeStr(currNode, nodesSoFar));
        if(currNode.literal !== null) {
          elToken = new ElToken({
            type: 'text',
            val: currNode.literal,
          });
        }
        break;
      case 'code':
        // console.log(`${soFarTypeStr} [${currNode.type}] - ${currNode.literal}`);
        // console.log(getSoFarNodeStr(currNode, nodesSoFar));
        if(currNode.literal !== null) {
          elToken = new ElToken({
            type: 'text',
            val: currNode.literal,
          });
        }
        break;
      case 'code_block':
        // console.log(currNode);
        if(currNode.literal !== null) {
          elToken = new ElToken({
            type: 'text',
            val: currNode.literal,
          });
        }
        break;
      case 'paragraph':
        elToken = new ElToken({
          type: 'block',
          val: 'p',
        });
        break;
      case 'heading':
        // console.log(currNode);
        elToken = new ElToken({
          type: 'block',
          val: `h${currNode.level}`,
        });
        break;
      default:
        console.log(`>> ${currNode.type}`);
        elToken = new ElToken({
          type: 'etc',
          val: 'type',
        });
    }
    if(elToken === undefined) {
      throw new Error(`Could not parse token for node of type: ${currNode.type}`);
    }
    if(elToken.type === 'block') {
      console.log(`(push): ${elToken.type} - ${elToken.val}`);
    }
    // elStack.push(elToken);
    pushToken(elToken);
  }

  function pushToken(token: ElToken) {
    switch(token.type) {
      case 'block':
        res.push(blockStr(token));
        break;
    }
    elStack.push(token);
  }

  function popToken() {
    let node = soFar.pop()!;
    let token = elStack.pop()!;
    // console.log(`(pop): ${node.type}`);
    switch(token.type) {
      case 'text':
        console.log(`(pop): ${node.type} - ${node.literal}`);
        res.push(token.val);
        break;
      case 'block':
        console.log(`(pop): ${node.type}`);
        // res.push(`~:_[${token.val}]`);
        if(token.hasClose()) {
          res.push(blockStr(token, true));
        }
        break;
    }
  }
  
  helper(cmNode);
  
  console.log(res.slice(Math.floor(res.length / 2)));
  // console.log(elStack.slice(Math.floor(elStack.length / 2)));
}

function blockStr(token: ElToken, close = false) {
  // return `~:_[${close ? '/ ' : ''}${token.val}]`;
  return `<${close ? '/' : ''}${token.val}>`;
}

function getSoFarNodeStr(currNode: commonmark.Node, soFar: commonmark.Node[]): string {
  let soFarTypeStr = soFar.map(sfNode => sfNode.type).join(', ');
  let literalStr = (currNode.literal === null) ? '' : ` - ${currNode.literal}`;
  let soFarNodeStr = `${soFarTypeStr} [${currNode.type}]${literalStr}`;
  return soFarNodeStr;
}
