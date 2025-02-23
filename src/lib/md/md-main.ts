
import path from 'path';
import fs from 'fs';

import { MdTokenizer, MdTokenizerNextRes } from './md-tokenizer';
import { getLineReader } from '../line-reader';
import { TEST_DATA_DIR_PATH } from '../constants';

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
  let nextRes: MdTokenizerNextRes | undefined;
  while((nextRes = tokenizer.next()) !== undefined) {
    //
    console.log(nextRes);
  }
  // console.log(tokenizer.next());
  // console.log(tokenizer);
}
