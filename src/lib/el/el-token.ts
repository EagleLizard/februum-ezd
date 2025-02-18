
import * as commonmark from 'commonmark';

type ElTokenType = 'text' | 'block' | 'etc' | 'term';

type ElTokenNodeType = Extract<commonmark.NodeType, (
  'heading' | 'paragraph' | 'strong' | 'emph' | 'block_quote'
  | 'text' | 'code' | 'code_block'
  | 'document'
)> | 'term'

type ElTokenOpts = {
  val?: string;
  level?: number;
};

const EL_TOKEN_TAG_MAP: Partial<Record<ElTokenNodeType, string>> = {
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
  nodeType: ElTokenNodeType;
  val?: string;
  level?: number;
  constructor(type: ElTokenType, nodeType: ElTokenNodeType, opts?: ElTokenOpts) {
    opts = opts ?? {};
    this.id = elTokenIdCounter++;
    this.type = type;
    this.nodeType = nodeType;
    this.val = opts.val;
    this.level = opts.level;
  }

  hasClose(): boolean {
    // return this.type === 'block' && this.nodeType !== 'paragraph';
    return this.type === 'block';
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
