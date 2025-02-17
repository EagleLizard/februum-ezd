
import path from 'path';
import fs from 'fs';

import * as commonmark from 'commonmark';

import { DATA_DIR_PATH } from '../constants';

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
  traverse2(parsed);
}

function traverse2(cmNode: commonmark.Node) {
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

function traverse(cmNode: commonmark.Node) {
  console.log(cmNode);
  console.log(cmNode.type);
  let depth = 0;
  // let currNode: commonmark.Node | null;
  // currNode = cmNode;
  let iters = 0;
  let queue: commonmark.Node[] = [ cmNode ];
  while(queue.length > 0) {
    let currNode: commonmark.Node = queue.shift()!;
    if(currNode.firstChild !== null) {
      queue.push(currNode);
    }
    console.log(`i: ${iters}, depth: ${depth}`);
    if(iters++ > 40) {
      break;
    }
  }
}


