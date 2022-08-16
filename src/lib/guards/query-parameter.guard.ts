import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Guard to check if certain query parameters are set.
 *
 * In the `data` attribute of route it expects an optional `redirectTo`
 * containing an {@link Observable}, a {@link Promise} or a direct
 * {@link UrlTree} or a string that will be passed to {@link Router#parseUrl}
 * and `queryParams` containing a string or an array of strings.
 *
 * - `redirect` will be used when the check fails.
 * - `queryParams` will be iterated to check for the keys
 */
@Injectable({
  providedIn: 'root'
})
export class QueryParameterGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let redirect  = route.data["redirect"] ?? false;
    if (typeof redirect === "string") redirect = this.router.parseUrl(redirect);
    for (let param of [route.data["queryParams"] ?? []].flat()) {
      if (route.queryParams[param] === undefined) return redirect;
    }
    return true;
  }

}
