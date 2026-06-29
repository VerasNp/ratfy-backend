import type Permission from '#domain/rbac/permission/Permission.js'

export interface PermissionRepository {
	createPermission(permission: Permission): Promise<void>
	deletePermission(permissionId: string): Promise<void>
	findPermissionById(permissionId: string): Promise<Permission | null>
	findPermissionByOperationIdAndResourceId(
		operationId: string,
		resourceId: string,
	): Promise<Permission | null>
	listPermissions(): Promise<Permission[]>
	listPermissionsByOperationId(operationId: string): Promise<Permission[]>
	listPermissionsByResourceId(resourceId: string): Promise<Permission[]>
}
