import type { SignupInput } from '#application/DTOs/SignupInput.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import argon2 from 'argon2'

class Signup {
	private userRepository: UserRepository
	constructor(userRepository: UserRepository) {
		this.userRepository = userRepository
	}

	async execute(userData: SignupInput): Promise<void> {
		const existingUser = await this.userRepository.findByEmail(userData.email)
		if (existingUser) {
			throw new Error('User with this email already exists')
		}
		const hash = await argon2.hash(userData.password)
		const user = User.create(userData.name, userData.email, hash, userData.birthDate)
		await this.userRepository.create(user)
	}
}

export default Signup
