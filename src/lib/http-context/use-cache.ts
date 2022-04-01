import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if cache headers should be sent.
 *
 * Defaults to `true`.
 */
export const USE_CACHE = new HttpContextToken<boolean>(() => true);
