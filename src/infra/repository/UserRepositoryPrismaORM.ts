import type { TransactionHandle } from '#application/ports/TransactionHandle.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import { Prisma, PrismaClient } from '#prisma/client'

class UserRepositoryPrismaORM implements UserRepository {
	constructor(private orm: PrismaClient) {}

	public async findAll(): Promise<User[]> {
		const users = await this.orm.user.findMany({
			include: { roles: { include: { role: true } } },
		})
		return users.map((user) => {
			const roles = user.roles.map((ur) =>
				Role.restore(ur.role.id, ur.role.name, ur.role.description),
			)
			return User.restore(
				user.id,
				user.name,
				user.email,
				user.password,
				user.birthDate,
				user.verifiedAt,
				roles,
			)
		})
	}

	public async create(user: User, tx?: TransactionHandle): Promise<User> {
		try {
			const client = tx ? (tx as unknown as Prisma.TransactionClient) : this.orm
			const createdUser = await client.user.create({
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					password: user.password,
					birthDate: user.birthDate,
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
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new UniqueConstraintError('Email already in use')
			}
			throw error
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.orm.user.findUnique({
			where: {
				email: email,
			},
			include: { roles: { include: { role: true } } },
		})
		if (!user) {
			return null
		}
		const roles = user.roles.map((ur) =>
			Role.restore(ur.role.id, ur.role.name, ur.role.description),
		)
		return User.restore(
			user.id,
			user.name,
			user.email,
			user.password,
			user.birthDate,
			user.verifiedAt,
			roles,
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
						email: userData.email,
						password: userData.password,
						birthDate: userData.birthDate,
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
				userData.email,
				userData.password,
				userData.birthDate,
				userData.verifiedAt || null,
				userData.roles,
			)
			return updatedUser
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					return null
				}
				if (error.code === 'P2002') {
					throw new UniqueConstraintError('Email already in use')
				}
			}
			throw error
		}
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.orm.user.findUnique({
			where: {
				id: id,
			},
			include: { roles: { include: { role: true } } },
		})
		if (!user) {
			return null
		}
		const roles = user.roles.map((ur) =>
			Role.restore(ur.role.id, ur.role.name, ur.role.description),
		)
		return User.restore(
			user.id,
			user.name,
			user.email,
			user.password,
			user.birthDate,
			user.verifiedAt,
			roles,
		)
	}
}

export default UserRepositoryPrismaORM
