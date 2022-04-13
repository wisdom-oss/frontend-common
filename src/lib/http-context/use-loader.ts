import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if loader should be shown.
 *
 * Useful for longer loading times.
 *
 * Defaults to `false`.
 */
export const USE_LOADER = new HttpContextToken<boolean>(() => false);
