import {HttpContextToken} from "@angular/common/http";

/**
 * {@link HttpContextToken} used to determine if the api url should be used.
 *
 * Implies {@link SEND_AUTH}.
 * Setting {@link SEND_AUTH} to `false` will deny filling the `Authorization`
 * header.
 *
 * Defaults to `false`.
 */
export const USE_API_URL = new HttpContextToken<boolean>(() => false);
