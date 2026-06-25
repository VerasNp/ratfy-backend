import type Permission from '#domain/rbac/permission/Permission.js'

export interface PermissionRepository {
	/**
	 * Creates a permission
	 * @param permissionData
	 */
	create(permissionData: Permission): Promise<Permission>
	/**
	 * List all permissions
	 */
	listPermissions(): Promise<Permission[]>
	/**
	 * Get a permission by its unique identifier
	 * @param permissionId The unique identifier of the permission
	 */
	findPermissionById(permissionId: string): Promise<Permission | null>
	/**
	 * Updates permission data
	 * @param permissionData Permission data updated
	 */
	updatePermission(permissionData: Permission): Promise<Permission | null>
	/**
	 * Deletes a permission
	 * @param permissionId The unique identifier of the permission
	 */
	deletePermission(permissionId: string): Promise<Permission | null>
}
