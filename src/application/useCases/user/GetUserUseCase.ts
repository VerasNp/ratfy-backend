import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class GetUserUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string): Promise<Output> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			this.loggerService.warn('GetUserUseCase: user not found', { userId })
			throw new UserNotFoundError()
		}
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			birthDate: user.birthDate,
			roles: user.roles.map((role) => ({
				id: role.id,
				name: role.name.value,
			})),
		}
	}
}

export default GetUserUseCase

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
