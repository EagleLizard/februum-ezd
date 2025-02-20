
import path from 'path';

import { MdTokenizer } from './md-tokenizer';
import { getLineReader } from '../line-reader';
import { DATA_DIR_PATH } from '../constants';

export async function mdMain() {
  let tokenizer = MdTokenizer.init();
  let testFilePath = [
    DATA_DIR_PATH,
    'md',
    'test2.md',
  ].join(path.sep);
  let lr = getLineReader(testFilePath);
  let line: string | undefined;
  while((line = await lr.read()) !== undefined) {
    console.log(line);
  }
  console.log('mdMain()');
  console.log(tokenizer);
}
