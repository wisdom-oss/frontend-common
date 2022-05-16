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
