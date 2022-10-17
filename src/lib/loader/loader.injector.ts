import {EventEmitter, Injectable} from '@angular/core';

/**
 * Injector for the `LoaderService` from the core module.
 *
 * The service in the core injects this injector and listens to emitted loaders.
 * This allows centralized logic in the core while also allowing other
 * components to inject custom loaders.
 */
@Injectable({
  providedIn: 'root'
})
export class LoaderInjector {

  /** Event emitter for the loaders, do not touch this. */
  loaders: EventEmitter<[Promise<any>, string?]> = new EventEmitter();

  /**
   * Add a custom loader to the loader service.
   * This will insert the promise resolution into the frame's loader curtain.
   * @param toResolve A promise that when resolved clears the loader
   * @param displayText Text to display under the loader, may contain a
   *                    translation key
   */
  addLoader(toResolve: Promise<any>, displayText?: string) {
    this.loaders.emit([toResolve, displayText]);
  }
}
