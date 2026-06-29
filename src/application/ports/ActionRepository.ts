import type Action from '#domain/rbac/action/Action.js'
import type Operation from '#domain/rbac/operation/Operation.js'

export interface ActionRepository {
	assignPermissionToResource(action: Action): Promise<Action>
	removePermissionFromResource(permissionId: string, resourceId: string): Promise<Action>
	findPermissionsByResourceId(resourceId: string): Promise<Operation[]>
	findActionByPermissionIdAndResourceId(
		permissionId: string,
		resourceId: string,
	): Promise<Action | null>
}
