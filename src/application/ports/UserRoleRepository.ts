import type { TransactionHandle } from "#application/ports/TransactionHandle.js"
import type Role from "#domain/rbac/role/Role.js"

export interface UserRoleRepository {
	/**
	 * Assigns a role to a user
	 * @param userId The unique identifier of the user
	 * @param roleId The unique identifier of the role
	 * @param tx Optional transaction handle for scoping the operation within a unit of work
	 */
	assignRoleToUser(userId: string, roleId: string, tx?: TransactionHandle): Promise<void>
	/**
	 * Removes a role from a user
	 * @param userId The unique identifier of the user
	 * @param roleId The unique identifier of the role
	 */
	removeRoleFromUser(userId: string, roleId: string): Promise<void>
	/**
	 * Finds all roles assigned to a user
	 * @param userId The unique identifier of the user
	 */
	findRolesByUserId(userId: string): Promise<Role[]>
}
