export class DisplayObjectUtil {
  public static removeFromParent(displayObj: PIXI.DisplayObject) {
    if (displayObj && displayObj.parent) {
      displayObj.parent.removeChild(displayObj);
    }
  }

  public static setOnTopOfParent(displayObj: PIXI.DisplayObject) {
    if (displayObj && displayObj.parent) {
      displayObj.parent.setChildIndex(displayObj, displayObj.parent.children.length - 1);
    }
  }
}
