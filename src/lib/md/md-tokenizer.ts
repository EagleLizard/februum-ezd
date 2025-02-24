
import { Stack } from '../datastruct/stack';
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
  charStack: Stack<string>;
  state: TK_STATE;
  private constructor(
    lines: string[],
  ) {
    this.lines = lines;

    this.line = 0;
    this.col = 0;
    this.tokens = [];
    this.charStack = new Stack();
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
        break;
      case 'LINE':
        token = this.parseLine(currLine);
        if(token?.type === 'NEWLINE') {
          this.state = 'LINE_START';
        }
        break;
    }
    if(token !== undefined) {
      this.tokens.push(token);
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
    if(currLine[this.col] === '*') {
      let token: MdToken;
      token = emph1Token(this.line, this.col);
      this.col += token.len;
      return token;
    }
    if(currLine[this.col] === '_') {
      let token: MdToken;
      token = emph2Token(this.line, this.col);
      this.col += token.len;
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
    let pos = startCol;
    let i = 0;
    while(pos < currLine.length) {
      let c = currLine[pos];
      let hasEmph = false;
      if(
        (c === '*')
        || (c === '_')
      ) {
        /*
          If there is an escape character '\', the number of escape
            characters on the stack determines if the char is emphasis
            or treated as a literal
        _*/
        let peekN = 0;
        let escCount = 0;
        while(this.charStack.peek(peekN++) === '\\') {
          escCount++;
        }
        if((escCount % 2) === 0) {
          hasEmph = true;
        }
      }
      if(hasEmph) {
        break;
      }
      this.charStack.push(c);
      i++;
      pos = startCol + i;
    }
    this.col = pos;
    if(this.charStack.len() > 0) {
      let str = this.charStack.arr.join('');
      this.charStack.clear();
      let token = textToken(this.line, startCol, str.length, str);
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

function emph2Token(line: number, col: number) {
  return MdToken.init('EMPHASIS_2', line, col, 1, { str: '_' });
}
function emph1Token(line: number, col: number) {
  return MdToken.init('EMPHASIS_1', line, col, 1, { str: '*' });
}

function textToken(line: number, col: number, len: number, str: string) {
  return MdToken.init('TEXT', line, col, len, {
    str,
  });
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
