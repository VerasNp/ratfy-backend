import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'

class UpdateRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(roleId: string, input: Input): Promise<Output> {
		const roleToUpdate = await this.roleRepository.findRoleById(roleId)
		if (!roleToUpdate) {
			this.loggerService.warn(`Role ${input.name} not found`, {
				origin: 'UpdateRoleUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		const existingRole = await this.roleRepository.findRoleByName(input.name)
		if (existingRole && existingRole.id !== roleId) {
			this.loggerService.warn(`Role with name ${input.name} already exists`, {
				origin: 'UpdateRoleUseCase',
			})
			throw new ResourceAlreadyExistsError('Role with the same name already exists')
		}
		roleToUpdate.updateData({
			name: input.name,
			description: input.description,
		})
		const updatedRole = await this.roleRepository.updateRole(roleToUpdate)
		return {
			id: updatedRole!.id,
			name: updatedRole!.name.value,
			description: updatedRole!.description,
		}
	}
}

export default UpdateRoleUseCase

type Input = {
	name: string
	description: string | null
}

type Output = {
	id: string
	name: string
	description: string | null
}
