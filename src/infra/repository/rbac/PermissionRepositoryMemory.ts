import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type Permission from '#domain/rbac/permission/Permission.js'

class PermissionRepositoryMemory implements PermissionRepository {
	public permissions: Permission[] = []

	public constructor(initialPermissions: Permission[] = []) {
		this.permissions = initialPermissions
	}

	public createPermission(permission: Permission): Promise<void> {
		this.permissions.push(permission)
		return Promise.resolve()
	}

	public deletePermission(permissionId: string): Promise<void> {
		this.permissions = this.permissions.filter((permission) => permission.id !== permissionId)
		return Promise.resolve()
	}

	public findPermissionById(permissionId: string): Promise<Permission | null> {
		const foundPermission = this.permissions.find(
			(permission) => permission.id === permissionId,
		)
		return Promise.resolve(foundPermission || null)
	}

	public findPermissionByOperationIdAndResourceId(
		operationId: string,
		resourceId: string,
	): Promise<Permission | null> {
		const foundPermission = this.permissions.find(
			(permission) =>
				permission.operation.id === operationId && permission.resource.id === resourceId,
		)
		return Promise.resolve(foundPermission || null)
	}

	public listPermissions(): Promise<Permission[]> {
		return Promise.resolve(this.permissions)
	}

	public listPermissionsByOperationId(operationId: string): Promise<Permission[]> {
		const foundPermissions = this.permissions.filter(
			(permission) => permission.operation.id === operationId,
		)
		return Promise.resolve(foundPermissions)
	}

	public listPermissionsByResourceId(resourceId: string): Promise<Permission[]> {
		const foundPermissions = this.permissions.filter(
			(permission) => permission.resource.id === resourceId,
		)
		return Promise.resolve(foundPermissions)
	}
}

export default PermissionRepositoryMemory
