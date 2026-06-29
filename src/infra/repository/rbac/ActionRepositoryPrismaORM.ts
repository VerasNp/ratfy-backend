import type { ActionRepository } from '#application/ports/ActionRepository.js'
import Action from '#domain/rbac/action/Action.js'
import Operation from '#domain/rbac/operation/Operation.js'
import type { PrismaClient } from '#prisma/client.js'

class ActionRepositoryPrismaORM implements ActionRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async assignPermissionToResource(action: Action): Promise<Action> {
		const createdAction = await this.orm.action.create({
			data: {
				id: action.id,
				permissionId: action.permissionId,
				resourceId: action.resourceId,
			},
		})
		return Action.restore(
			createdAction.id,
			createdAction.permissionId,
			createdAction.resourceId,
		)
	}

	public async removePermissionFromResource(
		permissionId: string,
		resourceId: string,
	): Promise<Action> {
		const deletedAction = await this.orm.action.delete({
			where: {
				resourceId_permissionId: {
					resourceId: resourceId,
					permissionId: permissionId,
				},
			},
		})
		return Action.restore(
			deletedAction.id,
			deletedAction.permissionId,
			deletedAction.resourceId,
		)
	}

	public async findPermissionsByResourceId(resourceId: string): Promise<Operation[]> {
		const foundActions = await this.orm.action.findMany({
			where: {
				resourceId: resourceId,
			},
			include: {
				permission: true,
			},
		})
		return foundActions.map((foundAction) =>
			Operation.restore(
				foundAction.permission.id,
				foundAction.permission.name,
				foundAction.permission.description,
			),
		)
	}
}

export default ActionRepositoryPrismaORM
