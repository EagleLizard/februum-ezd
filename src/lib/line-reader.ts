
import fs from 'fs';

import { Deferred } from './util/deferred';

type LineReader = {
  read: () => Promise<string | undefined>;
};

let MAX_LINES_TO_BUF = 10;

export function getLineReader(filePath: string): LineReader {
  let rs = fs.createReadStream(filePath, { encoding: 'utf8' });
  let buf: string;
  let lineQueue: string[];
  let pause = false;
  let rsEnd = false;
  let deferred = Deferred.init();

  buf = '';
  lineQueue = [];

  rs.on('data', (chunk) => {
    buf += chunk;
    let lines = buf.split(/\r?\n/);
    buf = lines.pop() ?? '';
    lineQueue.push(...lines);
    if(lineQueue.length > MAX_LINES_TO_BUF && !pause) {
      pause = true;
      rs.pause();
    }
    deferred.resolve();
  });
  rs.on('end', () => {
    rsEnd = true;
    if(buf.length > 0) {
      lineQueue.push(buf);
      buf = '';
    }
    deferred.resolve();
  });

  let res = {
    read,
  } satisfies LineReader;

  return res;

  async function read(): Promise<string | undefined> {
    // console.log(deferred);
    await deferred.promise;
    if(lineQueue.length > 0) {
      let line = lineQueue.shift()!;
      tryUnpause();
      return line; 
    } else if(rsEnd) {
      return undefined;
    } else {
      // unpause, try again
      tryUnpause();
      deferred = Deferred.init();
      await deferred.promise;
      return read();
    }
  }

  function tryUnpause() {
    if(lineQueue.length > MAX_LINES_TO_BUF) {
      return;
    }
    pause = false;
    rs.resume();
  }
}
