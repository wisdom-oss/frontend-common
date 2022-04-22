import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if loader should be shown.
 * A given string will be run through the translator and therefore may get
 * translated.
 *
 * Useful for longer loading times.
 *
 * Defaults to `false`.
 */
export const USE_LOADER = new HttpContextToken<string | boolean>(() => false);
