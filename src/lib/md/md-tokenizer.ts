
export class MdTokenizer {
  private constructor() {}

  parse(line: string) {
    console.log(line);
    if(line.length > 0) {
      //
    }
  }

  static init(): MdTokenizer {
    let mdTokenizer = new MdTokenizer();
    return mdTokenizer;
  }
}
