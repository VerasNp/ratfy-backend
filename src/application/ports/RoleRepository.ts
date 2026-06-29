import type Role from '#domain/rbac/role/Role.js'

export interface RoleRepository {
	/**
	 * Find role data by its name
	 * @param roleName Unique role name
	 */
	findRoleByName(roleName: string): Promise<Role | null>
	/**
	 * Creates a role
	 * @param roleData
	 */
	createRole(roleData: Role): Promise<Role>
	/**
	 * List all roles
	 */
	listRoles(): Promise<Role[]>
	/**
	 * Find a role by its unique identifier
	 * @param roleId The unique identifier of the role
	 */
	findRoleById(roleId: string): Promise<Role | null>
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
