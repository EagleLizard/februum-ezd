
import path from 'path';
import fs from 'fs';

import { MdTokenizer, MdTokenizerNextRes } from './md-tokenizer';
import { getLineReader } from '../line-reader';
import { TEST_DATA_DIR_PATH } from '../constants';
import { MdToken } from './md-tokens/md-token';

export async function mdMain() {
  console.log('mdMain()');
  let testFilePath = [
    TEST_DATA_DIR_PATH,
    'md',
    'test1.md',
  ].join(path.sep);
  // let lr = getLineReader(testFilePath);
  // let line: string | undefined;
  // while((line = await lr.read()) !== undefined) {
  //   // tokenizer.parse(line);
  // }
  let mdData = fs.readFileSync(testFilePath, {encoding: 'utf8'});
  let tokenizer = MdTokenizer.init(mdData);
  let nextRes: MdToken | undefined;
  let tokens: MdToken[] = [];
  while((nextRes = tokenizer.next()) !== undefined) {
    //
    // console.log(nextRes);
    tokens.push(nextRes);
  }
  let lines: string[] = [];
  let currLine = '';
  for(let i = 0; i < tokens.length; ++i) {
    let token = tokens[i];
    switch(token.type) {
      case 'ATX_HEADING':
        currLine += token.str;
        break;
      case 'NEWLINE':
        lines.push(currLine);
        currLine = '';
        break;
      case 'EMPTY_LINE':
        lines.push('');
        break;
      case 'TEXT':
        currLine += token.str;
        break;
    }
  }
  console.log(lines);
  // console.log(tokens.map(token => token.type));
  // console.log(tokens);
  // console.log(tokenizer.next());
  // console.log(tokenizer);
}
