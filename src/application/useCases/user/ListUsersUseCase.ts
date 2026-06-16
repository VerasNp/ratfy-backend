import type { GetUserOutputDTO } from "#application/DTOs/user/GetUserOutputDTO.js"
import type { LoggerPort } from "#application/ports/LoggerPort.js"
import type { UserRepository } from "#application/ports/UserRepository.js"

class ListUsersUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(): Promise<GetUserOutputDTO[]> {
		const users = await this.userRepository.findAll()
		this.loggerService.info('ListUsersUseCase: retrieved all users', { count: users.length })
		return users.map(user => ({
			id: user.id,
			name: user.name,
			email: user.email.value,
			birthDate: user.birthDate.value,
		}))
	}
}

export default ListUsersUseCase
