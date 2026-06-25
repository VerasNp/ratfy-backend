import type { ActionRepository } from '#application/ports/ActionRepository.js';
import Permission from '#domain/rbac/permission/Permission.js'
import type Resource from '#domain/rbac/resource/Resource.js'

class ActionRepositoryMemory implements ActionRepository {
	public permissionsResources: { permissionId: string; resourceId: string }[] = []
	private permissions: Permission[] = []

	public constructor(initPermissions: Permission[] = []) {
		this.permissions = initPermissions
	}

	public findPermissionsByResourceId(resourceId: string): Promise<Permission[]> {
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
