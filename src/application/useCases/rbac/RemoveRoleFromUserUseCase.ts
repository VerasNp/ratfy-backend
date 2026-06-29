import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class RemoveRoleFromUserUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly roleRepository: RoleRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string, roleId: string): Promise<Output> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			this.loggerService.warn(`User with id ${userId} not found`, {
				origin: 'RemoveRoleFromUserUseCase',
			})
			throw new ResourceNotFoundError('User not found')
		}
		const role = await this.roleRepository.findRoleById(roleId)
		if (!role) {
			this.loggerService.warn(`Role with id ${roleId} not found`, {
				origin: 'RemoveRoleFromUserUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		user.removeRole(role)
		const updatedUser = await this.userRepository.updateUser(user)
		this.loggerService.info(`Role with id ${roleId} removed from user with id ${userId}`, {
			origin: 'RemoveRoleFromUserUseCase',
		})
		return {
			userId: updatedUser!.id,
			userName: updatedUser!.name,
			roles: updatedUser!.roles.map((r) => ({ id: r.id, name: r.name.value })),
		}
	}
}

export default RemoveRoleFromUserUseCase

type Output = {
	userId: string
	userName: string
	roles: {
		id: string
		name: string
	}[]
}
