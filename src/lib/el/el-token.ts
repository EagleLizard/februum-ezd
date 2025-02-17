
type ElTokenType = 'text' | 'decorator' | 'block' | 'etc';

type ElTokenOpts = {
  type: ElTokenType;
  val: string;
};

export class ElToken implements ElTokenOpts {
  type: ElTokenType;
  val: string;
  constructor(opts: ElTokenOpts) {
    this.type = opts.type;
    this.val = opts.val;
  }

  hasClose(): boolean {
    return this.type === 'block' && this.val !== 'p';
  }
}
