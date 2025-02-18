
import * as commonmark from 'commonmark';

type ElTokenType = 'text' | 'block' | 'etc' | 'term';

type ElTokenNodeType = Extract<commonmark.NodeType, (
  'heading' | 'paragraph' | 'strong' | 'emph' | 'block_quote'
  | 'text' | 'code' | 'code_block'
  | 'document'
)> | 'term'

type ElTokenOpts = {
  type: ElTokenType;
  nodeType: ElTokenNodeType;
  val?: string;
  level?: number;
};

const EL_TOKEN_TAG_MAP: Record<ElTokenNodeType, string> = {
  heading: 'h',
  paragraph: 'p',
  strong: 'strong',
  emph: 'em',
  block_quote: 'blockquote',
};

let elTokenIdCounter = 0n;

export class ElToken implements ElTokenOpts {
  readonly id: bigint;
  type: ElTokenType;
  nodeType: ElTokenOpts['nodeType'];
  val?: string;
  // tag?: ElTokenOpts['tag'];
  level?: number;
  constructor(opts: ElTokenOpts) {
    this.id = elTokenIdCounter++;
    this.type = opts.type;
    this.val = opts.val;
    this.nodeType = opts.nodeType;
    // this.tag = opts.tag;
    this.level = opts.level;
  }

  hasClose(): boolean {
    // return this.type === 'block' && this.val !== 'p';
    return this.type === 'block' && this.nodeType !== 'paragraph';
  }

  attr(): string | undefined {
    let elTokenTag = EL_TOKEN_TAG_MAP[this.nodeType];
    if(this.nodeType === 'heading') {
      return `${elTokenTag}${this.level}`;
    }
    return EL_TOKEN_TAG_MAP[this.nodeType];
  }
  tag(close = false): string | undefined {
    let attr = this.attr(); 
    if(attr === undefined) {
      return undefined;
    }
    return `<${close ? '/' : ''}${attr}>`;
  }
}
