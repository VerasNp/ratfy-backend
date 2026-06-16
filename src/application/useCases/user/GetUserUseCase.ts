import type { GetUserOutputDTO } from '#application/DTOs/user/GetUserOutputDTO.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class GetUserUserCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string): Promise<GetUserOutputDTO> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			this.loggerService.warn('GetUserUseCase: user not found', { userId })
			throw new UserNotFoundError()
		}
		return {
			id: user.id,
			name: user.name,
			email: user.email.value,
			birthDate: user.birthDate.value,
		}
	}
}

export default GetUserUserCase
