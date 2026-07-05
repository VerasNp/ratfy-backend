import User from '#domain/user/User.js'
import type { PrismaClient } from '#prisma/client'

export async function createDummyUserPrismaORM(orm: PrismaClient, data: any = {}): Promise<User> {
	const user = await orm.user.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'Dummy User',
			email: data.email || 'foo@bar.com',
			password: data.password || 'password',
			birthDate: data.birthDate || new Date('2000-01-01'),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	})
	return User.restore(
		user.id,
		user.name,
		user.email,
		user.password,
		user.birthDate,
		user.verifiedAt,
	)
}

export function createDummyUser(data: any = {}): User {
	const verifiedAt = data.verifiedAt !== undefined ? data.verifiedAt : null
	return User.create(
		data.name || 'Dummy User',
		data.email || 'foo@bar.com',
		data.password || 'ValidPassword123!',
		data.birthDate || new Date('2000-01-01'),
		verifiedAt,
	)
}
