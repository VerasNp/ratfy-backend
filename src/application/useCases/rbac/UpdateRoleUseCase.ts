import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'

class UpdateRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly permissionRepository: PermissionRepository,
		private readonly resourceRepository: ResourceRepository,
		private readonly loggerService: LoggerPort,
		private readonly unitOfWork: UnitOfWork,
	) {}

	public async execute(input: RoleDTO): Promise<RoleDTO> {
		const roleToUpdate = await this.roleRepository.findRoleById(input.roleId)
		if (!roleToUpdate) {
			this.loggerService.warn(`Role ${input.name} not found`, {
				origin: 'UpdateRoleUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		const
	}
}

export default UpdateRoleUseCase

type RoleDTO = {
	name: string
	description: string | null
	actions: {
		resourceId: string
		permissionId: string
	}[]
}
