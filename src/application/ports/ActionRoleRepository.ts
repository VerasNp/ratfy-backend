import type { Action } from '#prisma/client'

export interface ActionRoleRepository {
	assignActionToRole(actionId: string, roleId: string): Promise<void>
	removeActionFromRole(actionId: string, roleId: string): Promise<void>
	findActionsByRoleId(roleId: string): Promise<Action[]>
}
