export interface TokenPort {
	/**
	 * Generates a token with the given payload and expiration time.
	 * @param payload The payload to be included in the token.
	 * @param expiredIn The expiration time of the token in seconds.
	 */
	generateToken(payload: Record<string, unknown>, expiredIn: number): string
	/**
	 * Verifies the given token and returns the decoded payload if the token is valid.
	 * @param token The token to be verified.
	 */
	verifyToken<T>(token: string): T
}
