export class ArrayUtil {
  static removeElement(array: Array<any>, element: any): boolean {
    var index = array.indexOf(element);
    if (index == -1)
      return false;
    array.splice(index, 1);
    return true;
  }

  static addUniqueElement(array: Array<any>, element: any): boolean {
    if (array.indexOf(element) != -1)
      return false;

    array.push(element);
    return true;
  }

  static sortNumeric(arr, ascending) {
    if (ascending) {
      arr.sort((a, b) => a - b);
    } else {
      arr.sort((a, b) => b - a);
    }
    return arr;
  }

  static sortNumericOn(arr, key, ascending) {
    if (ascending) {
      arr.sort((a, b) => a[key] - b[key]);
    } else {
      arr.sort((a, b) => b[key] - a[key]);
    }
    return arr;
  }
}
