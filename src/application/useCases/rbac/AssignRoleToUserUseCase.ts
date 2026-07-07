import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class AssignRoleToUserUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly roleRepository: RoleRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string, roleId: string): Promise<Output> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			this.loggerService.warn(`User with id ${userId} not found`, {
				origin: 'AssignRoleToUserUseCase',
			})
			throw new ResourceNotFoundError('User not found')
		}
		const role = await this.roleRepository.findRoleById(roleId)
		if (!role) {
			this.loggerService.warn(`Role with id ${roleId} not found`, {
				origin: 'AssignRoleToUserUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		user.assignRole(role)
		await this.userRepository.updateUser(user)
		this.loggerService.info(`Role with id ${roleId} assigned to user with id ${userId}`, {
			origin: 'AssignRoleToUserUseCase',
		})
		return {}
	}
}

export default AssignRoleToUserUseCase

type Output = {}
