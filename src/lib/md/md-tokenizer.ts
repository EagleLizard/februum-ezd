
import { MD_TOKEN_TYPE, MdToken } from './md-tokens/md-token';

export type MdTokenizerNextRes = {
  token: MdToken;
} & {};

type TK_STATE = 'INIT' | 'LINE_START' | 'LINE';

export class MdTokenizer {
  private lines: string[];

  line: number;
  col: number;
  readonly tokens: MdToken[];
  charStack: string[];
  state: TK_STATE;
  private constructor(
    lines: string[],
  ) {
    this.lines = lines;

    this.line = 0;
    this.col = 0;
    this.tokens = [];
    this.charStack = [];
    this.state = 'INIT';
  }

  next(): MdToken | undefined {
    let token: MdToken | undefined;
    let currLine = this.getCurrLine();
    if(currLine === undefined) {
      /* term */
      token = termToken(this.line, this.col);
      this.tokens.push(token);
      return;
    }
    // console.log(this.state);
    switch(this.state) {
      case 'INIT':
        this.state = 'LINE_START';
        return this.next();
      case 'LINE_START':
        token = this.parseLineStart(currLine);
        if(token === undefined) {
          this.state = 'LINE';
          return this.next();
        }
        if(token.len > 0) {
          this.state = 'LINE';
        }
        this.tokens.push(token);
        // return token;
        break;
      case 'LINE':
        token = this.parseLine(currLine);
        if(token?.type === 'NEWLINE') {
          this.state = 'LINE_START';
        }
        if(token !== undefined) {
          this.tokens.push(token);
          // return token;
        }
        break;
    }
    return token;
  }

  private parseLine(currLine: string) {
    if(this.col === currLine.length) {
      let token = newlineToken(this.line, this.col);
      this.tokens.push(token);
      this.incLine();
      return token;
    }
    /*
      For now, advance char-by-char.
      Initially treating every char as plain text.
      When block/inline parsing of other constructs, like
        code blocks, emphasis, links, etc., those will be
        detected here
    _*/
    let startCol = this.col;
    while(this.col < currLine.length) {
      let c = currLine[this.col];
      this.charStack.push(c);
      this.col++;
    }
    if(this.charStack.length > 0) {
      let str = this.charStack.join('');
      this.charStack.length = 0;
      let token = MdToken.init('TEXT', this.line, startCol, str.length, {
        str,
      });
      return token;
    }
  }

  private parseLineStart(currLine: string) {
    let token: MdToken | undefined;
    let rx: RegExp;
    if(currLine.length === 0) {
      token = emptyLineToken(this.line);
      this.incLine();
      return token;
    }
    rx = getHeaderRx();
    if(rx.test(currLine)) {
      let rxRes = currLine.match(rx);
      if(rxRes !== null) {
        let str = rxRes[0];
        let level = str.trim().length;
        let len = str.length;
        token = headingToken(this.line, this.col, len, str, level);
        this.col += len;
        return token;
      }
    }
  }

  private incLine() {
    this.line++;
    this.col = 0;
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

function newlineToken(line: number, col: number): MdToken {
  return MdToken.init('NEWLINE', line, col, 0);
}

function termToken(line: number, col: number): MdToken {
  return MdToken.init('TERM', line, col, 0);
}

function emptyLineToken(line: number): MdToken {
  return MdToken.init('EMPTY_LINE', line, 0, 0);
}

function headingToken(line: number, col: number, len: number, str: string, level: number): MdToken {
  return MdToken.init('ATX_HEADING', line, col, len, {
    str,
    level,
  });
}

function getHeaderRx() {
  return /^ {0,3}#{1,6}(?: |$)/;
}
