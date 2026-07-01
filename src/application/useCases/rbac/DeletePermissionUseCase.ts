import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'

class DeletePermissionUseCase {
	public constructor(
		private readonly permissionRepository: PermissionRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const permissionToDelete = await this.permissionRepository.findPermissionById(input.permissionId)
		if (!permissionToDelete) {
			this.loggerService.warn(`Permission with id ${input.permissionId} not found`, {
				origin: 'DeletePermissionUseCase',
			})
			throw new ResourceNotFoundError('Permission not found')
		}
		await this.permissionRepository.deletePermission(input.permissionId)
		this.loggerService.info(`Permission with id ${input.permissionId} deleted successfully`, {
			origin: 'DeletePermissionUseCase',
		})
		return {
			id: permissionToDelete.id,
			resource: {
				id: permissionToDelete.resource.id,
				name: permissionToDelete.resource.name.value,
			},
			permission: {
				id: permissionToDelete.operation.id,
				name: permissionToDelete.operation.name.value,
			},
			label: permissionToDelete.label,
		}
	}
}

export default DeletePermissionUseCase

type Input = {
	permissionId: string
}

type Output = {
	id: string
	resource: {
		id: string
		name: string
	}
	permission: {
		id: string
		name: string
	}
	label: string
}
