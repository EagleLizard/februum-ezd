
import path from 'path';
import fs from 'fs';

import { MdTokenizer, MdTokenizerNextRes } from './md-tokenizer';
import { getLineReader } from '../line-reader';
import { TEST_DATA_DIR_PATH } from '../constants';
import { MdToken } from './md-tokens/md-token';
import assert from 'assert';

export async function mdMain() {
  console.log('mdMain()');
  test1();
  testInline1();
}

function testInline1() {
  let testFilePath = [
    TEST_DATA_DIR_PATH,
    'md',
    'test_inline-1.md',
  ].join(path.sep);
  let mdData = fs.readFileSync(testFilePath, {encoding: 'utf8'});
  let tokenizer = MdTokenizer.init(mdData);
  let nextRes: MdToken | undefined;
  let tokens: MdToken[] = [];
  while((nextRes = tokenizer.next()) !== undefined) {
    console.log(nextRes.type);
    if(nextRes.str !== undefined) {
      console.log(nextRes);
    }
    tokens.push(nextRes);
  }
}

function test1() {
  let testFilePath = [
    TEST_DATA_DIR_PATH,
    'md',
    'test1.md',
  ].join(path.sep);
  let mdData = fs.readFileSync(testFilePath, {encoding: 'utf8'});
  let tokenizer = MdTokenizer.init(mdData);
  let nextRes: MdToken | undefined;
  let tokens: MdToken[] = [];
  while((nextRes = tokenizer.next()) !== undefined) {
    tokens.push(nextRes);
  }
  /*
    Reconstruct original markdown file
  _*/
  let tokenLines: string[] = [];
  let currLine = '';
  for(let i = 0; i < tokens.length; ++i) {
    let token = tokens[i];
    switch(token.type) {
      case 'ATX_HEADING':
        currLine += token.str;
        break;
      case 'NEWLINE':
        tokenLines.push(currLine);
        currLine = '';
        break;
      case 'EMPTY_LINE':
        tokenLines.push('');
        break;
      case 'TEXT':
        currLine += token.str;
        break;
    }
  }
  let tokenData = tokenLines.join('\n');
  assert(tokenData === mdData);
}
