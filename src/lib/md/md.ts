
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
  traverse(parsed);
}

function traverse(cmNode: commonmark.Node) {
  console.log(cmNode);
  console.log(cmNode.type);
  let walker = cmNode.walker();
  let walkRes: commonmark.NodeWalkingStep | null;
  while((walkRes = walker.next()) !== null) {
    console.log(walkRes.node.type);
  }
}
