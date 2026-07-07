export interface HashPort {
	/**
	 * Hashes a value and returns the resulting hash.
	 * @param value The value to be hashed.
	 */
	hash(value: string): Promise<string>
	/**
	 * Compares a value with a hash and returns true if they match, false otherwise.
	 * @param value The value to be compared.
	 * @param hash The hash to compare against.
	 */
	compare(value: string, hash: string): Promise<boolean>
}
