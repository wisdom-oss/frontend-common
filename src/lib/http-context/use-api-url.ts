import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if the api url should be used.
 *
 * Defaults to `false`.
 */
export const USE_API_URL = new HttpContextToken<boolean>(() => false);
