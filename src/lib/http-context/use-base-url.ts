import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if the base url should be used.
 *
 * Defaults to `true`.
 */
export const USE_BASE_URL = new HttpContextToken<boolean>(() => true);
