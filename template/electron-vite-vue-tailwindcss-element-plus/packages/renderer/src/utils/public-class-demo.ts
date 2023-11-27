export default class PublicClassDemo {
  param1: string;
  param2: boolean;
  param3: number;
  param4: Date;
  param5: any;
  clickHandler: (() => void) | null = null;

  constructor(param1: string, date: Date = new Date()) {
    this.param1 = param1;
    this.param2 = true;
    this.param3 = 1102;
    this.param4 = date;
    this.param5 = '2222';
  }


  classMethod1(changeShowFestivals: boolean): string {
    return '返回 string 结果';
  }

  classMethod2(): ClassObjectResult {
    const nongliString = '11111';
    const ganzhi = [
      '111',
      '222',
    ];

    const yangliString = '222222';

    return {
      nongliString,
      ganzhi,
      yangliString,
    };
  }
}

export declare interface ClassObjectResult {
  nongliString: string,
  ganzhi: string[],
  yangliString: string,
}
