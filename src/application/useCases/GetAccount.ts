import type { GetAccountOutputDTO } from '#application/DTOs/GetAccountOutputDTO.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class GetAccount {
	constructor(private userRepository: UserRepository) {}

	public async execute(id: string): Promise<GetAccountOutputDTO> {
		const user = await this.userRepository.findById(id)
		if (!user) {
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

export default GetAccount
