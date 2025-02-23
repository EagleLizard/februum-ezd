
export type MD_TOKEN_TYPE = 'EMPTY_LINE' | 'ATX_HEADING';

export type MdTokenOpts = {
  str?: string;
  level?: number;
} & {};

export class MdToken implements MdTokenOpts {
  readonly type: MD_TOKEN_TYPE;
  readonly line: number;
  readonly col: number;
  readonly len: number;
  readonly str?: string;
  readonly level?: number;
  protected constructor(
    type: MD_TOKEN_TYPE,
    line: number,
    col: number,
    len: number,
    opts?: MdTokenOpts
  ){
    this.type = type;
    this.line = line;
    this.col = col;
    this.len = len;
    this.str = opts?.str;
    this.level = opts?.level;
  }
  static init(
    type: MD_TOKEN_TYPE,
    line: number,
    col: number,
    len: number,
    opts?: MdTokenOpts,
  ): MdToken {
    let mdToken = new MdToken(
      type,
      line,
      col,
      len,
      opts,
    );
    return mdToken;
  }
}
