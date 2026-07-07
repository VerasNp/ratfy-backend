export interface LoggerPort {
	/**
	 * Logs an informational message.
	 * @param message The message to log.
	 * @param meta Optional metadata to include with the log message, such as additional context or structured data.
	 */
	info(message: string, meta?: Record<string, unknown>): void
	/**
	 * Logs a warning message.
	 * @param message The message to log.
	 * @param meta Optional metadata to include with the log message, such as additional context or structured data.
	 */
	warn(message: string, meta?: Record<string, unknown>): void
	/**
	 * Logs an error message.
	 * @param message The message to log.
	 * @param meta Optional metadata to include with the log message, such as additional context or structured data.
	 */
	error(message: string, meta?: Record<string, unknown>): void
	/**
	 * Logs a debug message.
	 * @param message The message to log.
	 * @param meta Optional metadata to include with the log message, such as additional context or structured data.
	 */
	debug(message: string, meta?: Record<string, unknown>): void
}
