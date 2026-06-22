import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class UserRepositoryPrismaORM implements UserRepository {
	constructor(private orm: PrismaClient) {}

	public async findAll(): Promise<User[]> {
		const users = await this.orm.user.findMany()
		return users.map((user) =>
			User.restore(
				user.id,
				user.name,
				user.email,
				user.password,
				user.birthDate,
				user.verifiedAt,
			),
		)
	}

	public async create(user: User): Promise<User> {
		const createdUser = await this.orm.user.create({
			data: {
				id: user.id,
				name: user.name,
				email: user.email.value,
				password: user.password.value,
				birthDate: user.birthDate.value,
				role: {
					create: {
						roleId: user.roleId,
					},
				},
			},
		})
		return User.restore(
			createdUser.id,
			createdUser.name,
			createdUser.email,
			createdUser.password,
			createdUser.birthDate,
			createdUser.verifiedAt,
		)
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
		return User.restore(
			user.id,
			user.name,
			user.email,
			user.password,
			user.birthDate,
			user.verifiedAt,
		)
	}

	async update(user: User): Promise<void> {
		await this.orm.user.update({
			where: {
				id: user.id,
			},
			data: {
				name: user.name,
				email: user.email.value,
				password: user.password.value,
				birthDate: user.birthDate.value,
				verifiedAt: user.verifiedAt || null,
			},
		})
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.orm.user.findUnique({
			where: {
				id: id,
			},
		})
		if (!user) {
			return null
		}
		return User.restore(
			user.id,
			user.name,
			user.email,
			user.password,
			user.birthDate,
			user.verifiedAt,
		)
	}
}

export default UserRepositoryPrismaORM
