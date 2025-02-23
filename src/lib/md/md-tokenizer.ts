
import { MD_TOKEN_TYPE, MdToken } from './md-tokens/md-token';

export type MdTokenizerNextRes = {

} & {};

export class MdTokenizer {
  line: number;
  col: number;
  readonly tokens: MdToken[];
  private constructor(
    private lines: string[],
  ) {
    this.line = 0;
    this.col = 0;
    this.tokens = [];
  }

  next(): MdTokenizerNextRes | undefined {
    let token: MdToken | undefined;
    let currLine = this.getCurrLine();
    if(currLine === undefined) {
      return;
    }
    if(currLine.length < 1) {
      /*
        Empty line
      _*/
      token = emptyLineToken(this.line);
      this.tokens.push(token);
      this.incLine();
      return token;
    }
    if(this.col === 0) {
      let rx: RegExp;
      rx = getHeaderRx();
      let rxExecRes = rx.exec(currLine);
      if(rxExecRes !== null) {
        let str = rxExecRes[0];
        let level = str.trim().length;
        token = headingToken(this.line, this.col, str.length, {
          str,
          level,
        });
        this.tokens.push(token);
        this.incCol(token.len);
        return token;
      }
    }
    console.log(currLine);
    console.log(`c: '${currLine[this.col]}'`);
  }

  private incLine() {
    this.line++;
    this.col = 0;
  }

  private incCol(len: number) {
    this.col += len;
  }

  private getCurrLine(): string | undefined {
    return this.lines[this.line];
  }

  static init(mdData: string): MdTokenizer {
    let lines = mdData.split(/\r?\n/);
    let mdTokenizer = new MdTokenizer(lines);
    return mdTokenizer;
  }
}

function emptyLineToken(line: number): MdToken {
  return MdToken.init('EMPTY_LINE', line, 0, 0);
}

function headingToken(line: number, col: number, len: number, opts: { str: string, level: number }): MdToken {
  return MdToken.init('ATX_HEADING', line, col, len, opts);
}

function getHeaderRx() {
  return /^ {0,3}#{1,6}(?: |$)/;
}
