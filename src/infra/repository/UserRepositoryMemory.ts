import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import type User from '#domain/user/User.js'

class UserRepositoryMemory implements UserRepository {
	public users: User[] = []

	public constructor(initialUsers: User[] = []) {
		this.users = initialUsers
	}

	public findAll(): Promise<User[]> {
		return Promise.resolve(this.users)
	}

	public async create(user: User): Promise<User> {
		const existing = this.users.find((u) => u.email.value === user.email.value)
		if (existing) {
			throw new UniqueConstraintError('Email already in use')
		}
		this.users.push(user)
		return user
	}

	findByEmail(email: string): Promise<User | null> {
		const user = this.users.find((u) => u.email.value === email)
		return Promise.resolve(user || null)
	}

	async updateUser(userData: User): Promise<User | null> {
		const index = this.users.findIndex((u) => u.id === userData.id)
		if (index === -1) {
			return null
		}
		const duplicate = this.users.find(
			(u) => u.email.value === userData.email.value && u.id !== userData.id,
		)
		if (duplicate) {
			throw new UniqueConstraintError('Email already in use')
		}
		this.users[index] = userData
		return userData
	}

	findById(id: string): Promise<User | null> {
		const user = this.users.find((u) => u.id === id)
		return Promise.resolve(user || null)
	}
}

export default UserRepositoryMemory
