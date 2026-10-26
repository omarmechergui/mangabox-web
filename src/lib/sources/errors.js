/**
 * Stable error codes for MangaBox source operations.
 */
export const SourceErrorCode = {
  SOURCE_UNAVAILABLE: "SOURCE_UNAVAILABLE",
  SOURCE_NOT_FOUND: "SOURCE_NOT_FOUND",
  OPERATION_NOT_SUPPORTED: "OPERATION_NOT_SUPPORTED",
  NOT_FOUND: "NOT_FOUND",
  INVALID_RESPONSE: "INVALID_RESPONSE",
  NETWORK_ERROR: "NETWORK_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  CORS_BLOCKED: "CORS_BLOCKED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Standard typed error for all source engine operations.
 */
export class SourceError extends Error {
  /**
   * @param {string} code - Error code from SourceErrorCode
   * @param {string} message - User-safe readable message
   * @param {string} [sourceId] - Identifier of the source that produced the error
   * @param {*} [cause] - Original error or context
   */
  constructor(code, message, sourceId = "unknown", cause = null) {
    super(message);
    this.name = "SourceError";
    this.code = code;
    this.sourceId = sourceId;
    this.cause = cause;
  }
}
