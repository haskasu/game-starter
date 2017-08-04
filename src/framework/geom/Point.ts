export class Point extends PIXI.Point {
  constructor(x?: number, y?: number) {
    super(x, y);
  }

  static polar(len: number, angle: number): Point {
    return new Point(Math.cos(angle) * len, Math.sin(angle) * len);
  }

  public toB2Vec(): b2Vec2 {
    return new b2Vec2(this.x, this.y);
  }

  public toString():string {
    return "" + this.x + "," + this.y;
  }

  static fromString(str:String):Point {
    if(str) {
      var params:Array<string> = str.split(',');
      if(params.length == 2) {
        return new Point(parseFloat(params[0]), parseFloat(params[1]));
      }
    }
    return null;
  }
}
