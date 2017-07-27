export class MathUtil {
  private static _180_DIVIDED_BY_PI: number = 180 / Math.PI;
  private static _PI_DIVIDED_BY_180: number = Math.PI / 180;

  public static get ONE_SECOND(): number {
    return 1000;
  }
  public static get ONE_MINUTE(): number {
    return 60000;
  }
  public static get ONE_HOUR(): number {
    return 3600000;
  }
  public static get ONE_DAY(): number {
    return 86400000;
  }
  public static get ONE_WEEK(): number {
    return 604800000;
  }

  private static _HALF_PI: number = Math.PI * 0.5;
  private static _TWO_PI: number = Math.PI * 2;

  public static get HALF_PI(): number {
    return MathUtil._HALF_PI;
  }
  public static get TWO_PI(): number {
    return MathUtil._TWO_PI;
  }

  public static radians2degrees(inRadians: number): number {
    return inRadians * MathUtil._180_DIVIDED_BY_PI;
  }

  public static degrees2radians(inDegrees: number): number {
    return inDegrees * MathUtil._PI_DIVIDED_BY_180;
  }

  public static numberFollowTarget(
    num: number,
    target: number,
    rate: number,
    minDistance: number = 0,
    maxDistance: number = Number.MAX_VALUE
  ) {
    var dx: number = target - num;

    if (Math.abs(dx) > minDistance) {
      let movex: number = dx * rate;
      let absMovex: number = Math.abs(movex);

      if (absMovex < minDistance) {
        movex = dx > 0 ? minDistance : -minDistance;
      } else if (absMovex > maxDistance) {
        movex = dx > 0 ? maxDistance : -maxDistance;
      }
      return num + movex;
    }
    return target;
  }

  public static pointFollowTarget(
    point,
    target,
    rate: number,
    minDistance: number = 0,
    maxDistance: number = Number.MAX_VALUE
  ) {
    var dx: number = target.x - point.x;
    var dy: number = target.y - point.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > minDistance) {
      let len: number = Math.min(maxDistance, Math.max(minDistance, distance * rate));
      var scale: number = len / distance;
      point.x += dx * scale;
      point.y += dy * scale;
    } else {
      point.x = target.x;
      point.y = target.y;
    }
  }

  public static formatTimer(time: number, showMs: boolean = true) {
    var mins: number = Math.floor(time / 60000);
    time -= mins * 60;
    var secs: number = Math.floor(time / 1000);
    time -= secs;
    var msecs: number = Math.floor(time);
    var mstr: string = "" + mins;
    while (mstr.length < 2)
      mstr = "0" + mstr;
    var sstr: string = "" + secs;
    while (sstr.length < 2)
      sstr = "0" + sstr;
    var msstr: string = "" + msecs;
    while (msstr.length < 2)
      msstr = "0" + msstr;
    if (showMs)
      return mstr + ":" + sstr + ":" + msstr;
    return mstr + ":" + sstr;
  }
}
