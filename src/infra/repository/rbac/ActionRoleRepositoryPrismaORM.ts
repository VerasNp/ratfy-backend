import type { ActionRoleRepository } from '#application/ports/ActionRoleRepository.js'
import Action from '#domain/rbac/action/Action.js'
import type { PrismaClient } from '#prisma/client.js'

class ActionRoleRepositoryPrismaORM implements ActionRoleRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async assignActionToRole(actionId: string, roleId: string): Promise<void> {
		await this.orm.actionRole.create({
			data: {
				actionId: actionId,
				roleId: roleId,
			},
		})
	}

	public async removeActionFromRole(actionId: string, roleId: string): Promise<void> {
		await this.orm.actionRole.delete({
			where: {
				roleId_actionId: {
					actionId: actionId,
					roleId: roleId,
				},
			},
		})
	}

	public async findActionsByRoleId(roleId: string): Promise<Action[]> {
		const foundActions = await this.orm.actionRole.findMany({
			where: {
				roleId: roleId,
			},
			include: {
				action: {
					include: {
						roles: true,
						permission: true,
					},
				},
			},
		})
		return foundActions.map((foundAction) => {
			return Action.restore(
				foundAction.action.id,
				foundAction.action.permissionId,
				foundAction.action.resourceId,
			)
		})
	}
}

export default ActionRoleRepositoryPrismaORM
