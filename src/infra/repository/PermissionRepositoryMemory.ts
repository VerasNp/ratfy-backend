import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type Permission from '#domain/rbac/permission/Permission.js'

class PermissionRepositoryMemory implements PermissionRepository {
	public permissions: Permission[] = []

	public create(permission: Permission): Promise<Permission> {
		this.permissions.push(permission)
		return Promise.resolve(permission)
	}

	public listPermissions(): Promise<Permission[]> {
		return Promise.resolve(this.permissions)
	}

	public getPermissionById(permissionId: string): Promise<Permission | null> {
		const foundPermission = this.permissions.find((permission) => permission.id == permissionId)
		if (!foundPermission) {
			return Promise.resolve(null)
		}
		return Promise.resolve(foundPermission)
	}

	public updatePermission(permissionData: Permission): Promise<Permission | null> {
		const foundPermissionIndex = this.permissions.findIndex(
			(permission) => permission.id === permissionData.id,
		)
		if (foundPermissionIndex === -1) {
			return Promise.resolve(null)
		}
		this.permissions[foundPermissionIndex] = permissionData
		return Promise.resolve(permissionData)
	}

	public deletePermission(permissionId: string): Promise<Permission | null> {
		const permissionToDelete = this.permissions.find(
			(permission) => permission.id === permissionId,
		)
		if (!permissionToDelete) {
			return Promise.resolve(null)
		}
		this.permissions = this.permissions.filter((permission) => permission.id !== permissionId)
		return Promise.resolve(permissionToDelete)
	}
}

export default PermissionRepositoryMemory
