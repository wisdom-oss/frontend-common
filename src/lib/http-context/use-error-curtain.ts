import { HttpContextToken } from "@angular/common/http";

/**
 * Variants of the error handler.
 *
 * This enum is exposed via the {@link USE_ERROR_HANDLER#handler} property.
 */
enum ErrorHandler {
  /**
   * Raise a curtain displaying the error message and covering the whole main
   * container.
   */
  CURTAIN,

  /**
   * Spawn a small toast notification displaying the error and allowing further
   * use of the main container.
   */
  TOAST,

  /**
   * The error is passed through and should be handled by the implementor.
   */
  CUSTOM,
}

/**
 * Extension of the HttpContextToken class to expose the {@link ErrorHandler}
 * enum.
 *
 * This class allows accessing the {@link ErrorHandler} enum through the
 * {@link USE_ERROR_HANDLER} token.
 */
class ErrorHttpContextToken extends HttpContextToken<ErrorHandler> {

  /**
   * Re-export of the {@link ErrorHandler} enum for accessing it via the
   * {@link USE_ERROR_HANDLER} token.
   */
  readonly handler = ErrorHandler;
}

/**
 * {@link HttpContextToken} used to determine how HTTP errors should be handled.
 *
 * The enum associated with this token has three variants that define the behavior
 * when an error occurs:
 *
 * - `CURTAIN`: Raise a curtain displaying the error message and covering the
 *   entire main container.
 *
 * - `TOAST`: Display a small toast notification showing the error and allowing
 *   continued use of the main container.
 *
 * - `CUSTOM`: The error is passed through and should be handled by the implementor.
 *
 * This token defaults to {@link ErrorHandler#CURTAIN}.
 */
export const USE_ERROR_HANDLER = new ErrorHttpContextToken(() => ErrorHandler.CURTAIN);
