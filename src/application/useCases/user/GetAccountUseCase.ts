import type { GetAccountOutputDTO } from '#application/DTOs/GetAccountOutputDTO.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'

class GetAccountUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(id: string): Promise<GetAccountOutputDTO> {
		const user = await this.userRepository.findById(id)
		if (!user) {
			this.loggerService.warn('GetAccountUseCase: user not found', { userId: id })
			throw new UserNotFoundError('User not found')
		}
		return {
			id: user.id,
			name: user.name,
			email: user.email.value,
			birthDate: user.birthDate.value,
			verifiedAt: user.verifiedAt,
			roleId: user.roleId,
		}
	}
}

export default GetAccountUseCase
