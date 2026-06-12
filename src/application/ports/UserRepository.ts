import type User from '#domain/user/User.js'

export interface UserRepository {
	create(user: User): Promise<void>
	findByEmail(email: string): Promise<User | null>
}
