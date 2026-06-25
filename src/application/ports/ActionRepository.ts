import type Action from '#domain/rbac/action/Action.js'
import type Permission from '#domain/rbac/permission/Permission.js'

export interface ActionRepository {
	assignPermissionToResource(action: Action): Promise<Action>
	removePermissionFromResource(permissionId: string, resourceId: string): Promise<Action>
	findPermissionsByResourceId(resourceId: string): Promise<Permission[]>
}
