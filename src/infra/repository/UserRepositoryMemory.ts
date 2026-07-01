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

	public create(user: User): Promise<User> {
		this.users.push(user)
		return Promise.resolve(user)
	}

	findByEmail(email: string): Promise<User | null> {
		const user = this.users.find((u) => u.email.value === email)
		return Promise.resolve(user || null)
	}

	updateUser(userData: User): Promise<User | null> {
		const index = this.users.findIndex((u) => u.id === userData.id)
		if (index === -1) {
			return Promise.resolve(null)
		}
		this.users[index] = userData
		return Promise.resolve(userData)
	}

	findById(id: string): Promise<User | null> {
		const user = this.users.find((u) => u.id === id)
		return Promise.resolve(user || null)
	}
}

export default UserRepositoryMemory
