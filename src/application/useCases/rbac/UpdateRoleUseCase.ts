import type { RoleDTO } from '#application/DTOs/rbac/RoleDTO.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'

class UpdateRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly permissionRepository: OperationRepository,
		private readonly resourceRepository: ResourceRepository,
		private readonly loggerService: LoggerPort,
		private readonly unitOfWork: UnitOfWork,
	) {}

	public async execute(roleId: string, input: RoleDTO): Promise<void> {
		const roleToUpdate = await this.roleRepository.findRoleById(roleId)
		if (!roleToUpdate) {
			this.loggerService.warn(`Role ${input.name} not found`, {
				origin: 'UpdateRoleUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
	}
}

export default UpdateRoleUseCase

