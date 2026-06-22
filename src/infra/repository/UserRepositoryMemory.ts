import type { UserRepository } from '#application/ports/UserRepository.js'
import type User from '#domain/user/User.js'

class UserRepositoryMemory implements UserRepository {
	private users: User[] = []

	public findAll(): Promise<User[]> {
		return Promise.resolve(this.users)
	}

	public create(user: User): Promise<void> {
		this.users.push(user)
		return Promise.resolve()
	}

	findByEmail(email: string): Promise<User | null> {
		const user = this.users.find((u) => u.email.value === email)
		return Promise.resolve(user || null)
	}

	update(user: User): Promise<void> {
		const index = this.users.findIndex((u) => u.id === user.id)
		if (index !== -1) {
			this.users[index] = user
		}
		return Promise.resolve()
	}

	findById(id: string): Promise<User | null> {
		const user = this.users.find((u) => u.id === id)
		return Promise.resolve(user || null)
	}
}

export default UserRepositoryMemory
