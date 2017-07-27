export class IntUtil {
  static random(max: number): number {
    return Math.floor(Math.random() * (max + 1));
  }
  static randomBetween(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}
