import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import { Prisma, PrismaClient } from '#prisma/client'

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

	async updateUser(userData: User): Promise<User | null> {
		try {
			let updatedUser: User
			await this.orm.$transaction(async (tx) => {
				await tx.user.update({
					where: {
						id: userData.id,
					},
					data: {
						name: userData.name,
						email: userData.email.value,
						password: userData.password.value,
						birthDate: userData.birthDate.value,
						verifiedAt: userData.verifiedAt || null,
					},
				})
				await tx.userRole.deleteMany({
					where: {
						userId: userData.id,
					},
				})
				if (userData.roles.length > 0) {
					await tx.userRole.createMany({
						data: userData.roles.map((role) => ({
							userId: userData.id,
							roleId: role.id,
						})),
					})
				}
			})
			updatedUser = User.restore(
				userData.id,
				userData.name,
				userData.email.value,
				userData.password.value,
				userData.birthDate.value,
				userData.verifiedAt || null,
				userData.roles,
			)
			return updatedUser
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
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
