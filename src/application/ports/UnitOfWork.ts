import type { TransactionHandle } from './TransactionHandle.js'

export interface UnitOfWork {
	/**
	 * Executes a function within a transactional context. If the function throws an error, the transaction will be rolled back.
	 * @param fn The function to execute within the transaction, receiving a TransactionHandle for scoped queries
	 */
	execute<T>(fn: (tx: TransactionHandle) => Promise<T>): Promise<T>
}
