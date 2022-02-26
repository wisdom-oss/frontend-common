/**
 * Interface for the wisdom modules.
 *
 * Every wisdom module must provide such an object implementing this interface.
 * The object must be exported under the name "wisdomInterface".
 */
export interface WisdomInterface {
  /** The path to the component displaying the module. */
  path: string;
  /** The scopes required to see the component. */
  scopes: string[];
  /** The entry component that should be displayed. */
  entryComponent: any;
  /**
   * The translations the modules provides and uses.
   *
   * The top most entry should be the namespace, the following the component and
   * in the component there should be keys for the translation keys.
   */
  translations: Record<string, Record<string, Record<string, Record<string, string>>>>
}
