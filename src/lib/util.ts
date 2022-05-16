/**
 * Generates deterministically a hex color code from any string.
 *
 * This is a modernized version of this
 * [StackOverflow reply](https://stackoverflow.com/a/16348977/15800714).
 * @param str A string to generate a hex color for
 * @param map A color map for predefined strings
 *
 * @returns A hex color code in the style of '#abc123'
 */
import {TranslateService} from "@ngx-translate/core";
import {Inject} from "@angular/core";

export function stringToColor(str: string, map?: Record<string, string>): string {
  if (map && map[str]) {
    return map[str];
  }
  let hash = 0;
  for (let s of str) {
    hash = s.charCodeAt(0) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

/**
 * Returns a number presentation where every third digit from the end is
 * separated by a dot.
 * @example prettyPrintNum(12345678) => "12.345.678"
 * @param num Number to pretty print
 */
export function prettyPrintNum(num: number): string {
  return num
    .toString()
    .split("")
    .reverse()
    .map((value, index) => index % 3 == 0 ? value + "." : value)
    .reverse()
    .join("")
    .slice(0, -1);
}

/**
 * Utility function to translate strings in any data object using the given
 * translate service.
 *
 * Internally the `instant()` method is used, causing this to be sync, beware.
 * @param service Translate service to translate with
 * @param obj Object to iterate and translate through
 */
export function translateObject<T>(service: TranslateService, obj: T): T {
  function internalTranslate(obj: any): any {
    console.log(obj);
    switch (typeof obj) {
      case "object":
        let newObj: any = {};
        for (let [key, val] of Object.entries(obj)) {
          newObj[key] = internalTranslate(val);
        }
        return newObj
      case "string":
        return service.instant(obj);
      default:
        return obj;
    }
  }
  return internalTranslate(obj);
}
