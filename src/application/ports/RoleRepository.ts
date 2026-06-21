import type Role from '#domain/rbac/role/Role.js'

export interface RoleRepository {
	/**
	 * Creates a role
	 * @param roleData
	 */
	create(roleData: Role): Promise<Role>
	/**
	 * List all roles
	 */
	listRoles(): Promise<Role[]>
	/**
	 * Get a role by its unique identifier
	 * @param roleId The unique identifier of the role
	 */
	getRoleById(roleId: string): Promise<Role | null>
	/**
	 * Updates Role data
	 * @param roleData Role data updated
	 */
	updateRole(roleData: Role): Promise<Role | null>
	/**
	 * Deletes a Role
	 * @param roleId The unique identifier of the Role
	 */
	deleteRole(roleId: string): Promise<Role | null>
}
