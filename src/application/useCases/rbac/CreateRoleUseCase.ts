import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import Role from '#domain/rbac/role/Role.js'

class CreateRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const roleToCreate = Role.create(input.name, input.description ?? null)
		const foundRole = await this.roleRepository.findRoleByName(roleToCreate.name.value)
		if (foundRole) {
			this.loggerService.warn(`Role with name ${roleToCreate.name} already exists`, {
				origin: 'CreateRoleUseCase',
			})
			throw new ResourceAlreadyExistsError(
				`Role with name ${roleToCreate.name} already exists`,
			)
		}
		const createdRole = await this.roleRepository.createRole(roleToCreate)
		this.loggerService.info(`Role created successfully: ${createdRole.name}`, {
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

type Input = {
	name: string
	description?: string | null
}

type Output = {
	id: string
	name: string
	description: string | null
}
