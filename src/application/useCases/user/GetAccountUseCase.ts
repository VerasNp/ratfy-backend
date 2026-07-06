import type { UserRepository } from '#application/ports/UserRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'

class GetAccountUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string): Promise<Output> {
		const foundUser = await this.userRepository.findById(userId)
		if (!foundUser) {
			this.loggerService.warn('GetAccountUseCase: user not found', {
				origin: 'GetAccountUseCase',
			})
			throw new ResourceNotFoundError('User not found')
		}
		return {
			id: foundUser.id,
			name: foundUser.name,
			email: foundUser.email,
			birthDate: foundUser.birthDate,
			verifiedAt: foundUser.verifiedAt,
			roles: foundUser.roles.map((role) => ({
				id: role.id,
				name: role.name.value,
			})),
		}
	}
}

export default GetAccountUseCase

type Output = {
	id: string
	name: string
	email: string
	birthDate: Date
	verifiedAt: Date | null
	roles: {
		id: string
		name: string
	}[]
}
