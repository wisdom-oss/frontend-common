import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if the authorization header should
 * be sent.
 *
 * As long as this context is set to `undefined` it is implied by
 * {@link USE_API_URL} to be `true`.
 *
 * Defaults to `undefined`.
 */
export const SEND_AUTH = new HttpContextToken<undefined | boolean>(() => undefined);
