import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'

class DeleteRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(roleId: string): Promise<Output> {
		const roleToDelete = await this.roleRepository.findRoleById(roleId)
		if (!roleToDelete) {
			this.loggerService.warn(`Role with id ${roleId} not found`, {
				origin: 'DeleteRoleUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		await this.roleRepository.deleteRole(roleId)
		this.loggerService.info(`Role with id ${roleId} deleted successfully`, {
			origin: 'DeleteRoleUseCase',
		})
		return {
			id: roleToDelete.id,
			name: roleToDelete.name.value,
			description: roleToDelete.description,
		}
	}
}

export default DeleteRoleUseCase

type Output = {
	id: string
	name: string
	description: string | null
}
