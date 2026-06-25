import type { RoleDTO } from '#application/DTOs/rbac/RoleDTO.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import Role from '#domain/rbac/role/Role.js'

class CreateRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: RoleDTO): Promise<RoleDTO> {
		const roleToCreate = Role.create(input.name, input.description ?? null)
		const foundRole = await this.roleRepository.findRoleByName(roleToCreate.name.value)
		if (foundRole) {
			this.loggerService.warn(`Role with name ${roleToCreate.name.value} already exists`, {
				origin: 'CreateRoleUseCase',
			})
			throw new ResourceAlreadyExistsError(`Role with name ${roleToCreate.name.value} already exists`)
		}
		const createdRole = await this.roleRepository.create(roleToCreate)
		this.loggerService.info(`Role created successfully: ${createdRole.name.value}`, {
			origin: 'CreateRoleUseCase',
		})
		return {
			id: createdRole.id,
			name: createdRole.name.value,
			description: createdRole.description,
		}
	}
}

export default CreateRoleUseCase
