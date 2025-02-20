
export class MdTokenizer {
  private constructor() {}

  parse(line: string) {
    console.log(line);
  }

  static init(): MdTokenizer {
    let mdTokenizer = new MdTokenizer();
    return mdTokenizer;
  }
}
