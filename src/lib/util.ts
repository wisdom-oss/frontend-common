import {ActivatedRouteSnapshot} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

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

/**
 * Utility function to swap the values of a tuple.
 *
 * Useful if coordinates are in the wrong order.
 * (e.g. geojson to leaflet)
 *
 * @param tuple Tuple of two values
 * @return Tuple with swapped values
 */
export function tupleSwap<L, R>(tuple: [L, R]): [R, L] {
  return [tuple[1], tuple[0]];
}

/**
 * Function to return a fully resolved url in a string from an activated route
 * snapshot.
 *
 * Recreated by [this solution](https://stackoverflow.com/a/67232620/15800714) on StackOverflow.
 *
 * @param route Route snapshot of a component.
 */
export function getResolvedUrl(route: ActivatedRouteSnapshot): string {
  let url = route.pathFromRoot.map(
    v => v.url.map(
      segment => segment.toString()
    ).join("/")
  ).join("/");
  const queryParam = route.queryParamMap;
  if (queryParam.keys.length) {
    url += "?" + queryParam.keys.map(
      key => queryParam.getAll(key).map(
        value => `${key}=${value}`
      ).join("&")
    ).join("&");
  }
  return url;
}

export function getBulmaPrimaryColors() {
  let v = (p: string) => getComputedStyle(document.documentElement)
    .getPropertyValue(`--bulma-primary-${p}`);

  return {
    primary: v("primary"),
    link: v("link"),
    info: v("info"),
    success: v("success"),
    warning: v("warning"),
    danger: v("danger"),
    dark: v("dark"),
    text: v("text"),
  }
}

/** Inverts a given predicate. */
export function not<F extends (...args: any[]) => boolean>(predicate: F): F {
  return ((...args: any[]) => !predicate(...args)) as F
}

/** Utility type to make certain fields in a type required. */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Utility type to describe that a type could be one or many. */
export type OneOrMany<T> = T | T[];
