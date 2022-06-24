import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if requests that error should show
 * the error message on curtain covering the whole main container.
 *
 * Disable this if you want to handle errors yourself.
 *
 * Defaults to `true`.
 */
export const USE_ERROR_CURTAIN = new HttpContextToken<string | boolean>(() => true);
