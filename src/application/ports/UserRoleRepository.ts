export interface UserRoleRepository {
	/**
	 * Assigns a role to a user
	 * @param userId The unique identifier of the user
	 * @param roleId The unique identifier of the role
	 */
	assignRoleToUser(userId: string, roleId: string): Promise<void>
	/**
	 * Removes a role from a user
	 * @param userId The unique identifier of the user
	 * @param roleId The unique identifier of the role
	 */
	revokeRoleFromUser(userId: string, roleId: string): Promise<void>
}
