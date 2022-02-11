export interface WisdomInterface {
  path: string;
  scopes: string[];
  entryComponent: any;
  translations: Record<string, Record<string, Record<string, Record<string, string>>>>
}
