import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class UserRepositoryPrismaORM implements UserRepository {
	private orm: PrismaClient

	constructor(orm: PrismaClient) {
		this.orm = orm
	}

	async create(user: User): Promise<void> {
		await this.orm.user.create({
			data: {
				id: user.id,
				name: user.name,
				email: user.email.value,
				password: user.password.value,
				birthDate: user.birthDate.value,
			},
		})
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.orm.user.findUnique({
			where: {
				email: email,
			},
		})
		if (!user) {
			return null
		}
		return User.restore(user.id, user.name, user.email, user.password, user.birthDate)
	}
}

export default UserRepositoryPrismaORM
