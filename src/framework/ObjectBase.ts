import { ArrayUtil } from "./utils/ArrayUtil";

export class ObjectBase {
  private static _objects_map = {};

  public static getObjects<T>(type: string): Array<T> {
    var list = ObjectBase._objects_map[type];
    return list || [];
  }

  public static getObject<T>(type: string): T {
    var list: Array<T> = ObjectBase.getObjects<T>(type);
    return list.length ? list[0] : null;
  }

  constructor() {
    var type: string = this.objectType;
    var list = ObjectBase._objects_map[type];
    if (list == null) {
      list = ObjectBase._objects_map[type] = [];
    }
    list.push(this);
  }

  public get objectType(): string {
    return this.constructor.name;
  }

  dispose() {
    ArrayUtil.removeElement(ObjectBase.getObjects(this.objectType), this);
  }
}
