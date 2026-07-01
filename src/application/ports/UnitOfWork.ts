export interface UnitOfWork {
	/**
	 * Executes a function within a transactional context. If the function throws an error, the transaction will be rolled back.
	 * @param fn The function to execute within the transaction
	 */
	execute<T>(fn: () => Promise<T>): Promise<T>
}
