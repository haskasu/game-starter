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
}
