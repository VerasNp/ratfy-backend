import type { PermissionRepository } from '#application/ports/PermissionRepository.js';
import Operation from '#domain/rbac/operation/Operation.js'
import type Resource from '#domain/rbac/resource/Resource.js'

class ActionRepositoryMemory implements PermissionRepository {
	public permissionsResources: { permissionId: string; resourceId: string }[] = []
	private permissions: Operation[] = []

	public constructor(initPermissions: Operation[] = []) {
		this.permissions = initPermissions
	}

	public findPermissionsByResourceId(resourceId: string): Promise<Operation[]> {
		const foundPermissionsResources = this.permissionsResources.filter(
			(permissionResource) => permissionResource.resourceId === resourceId,
		)
		const permissions = foundPermissionsResources.map((permissionResource) => {
			const permission = this.permissions.find(
				(permission) => permission.id === permissionResource.permissionId,
			)
			return permission!
		})
		return Promise.resolve(permissions)
	}

	public assignPermissionToResource(permissionId: string, resourceId: string): Promise<void> {
		this.permissionsResources.push({ permissionId: permissionId, resourceId: resourceId })
		return Promise.resolve()
	}

	public removePermissionFromResource(permissionId: string, resourceId: string): Promise<void> {
		this.permissionsResources = this.permissionsResources.filter(
			(permissionResource) =>
				permissionResource.permissionId !== permissionId &&
				permissionResource.resourceId !== resourceId,
		)
		return Promise.resolve()
	}
}

export default ActionRepositoryMemory
