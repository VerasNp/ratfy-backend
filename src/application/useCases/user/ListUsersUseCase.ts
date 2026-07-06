import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class ListUsersUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(): Promise<Output[]> {
		const users = await this.userRepository.findAll()
		this.loggerService.info('ListUsersUseCase: retrieved all users', { count: users.length })
		return users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			birthDate: user.birthDate,
			roles: user.roles.map((role) => ({
				id: role.id,
				name: role.name.value,
			})),
		}))
	}
}

export default ListUsersUseCase

type Output = {
	id: string
	name: string
	email: string
	birthDate: Date
	roles: {
		id: string
		name: string
	}[]
}
