import Role from '#domain/rbac/role/Role.js'
import type { PrismaClient } from '#prisma/client'

export function createDummyRole(data: any = {}): Role {
	return Role.create(data.name || 'User', data.description || 'Default user role')
}

export async function createDummyRolePrismaORM(orm: PrismaClient, data: any = {}): Promise<Role> {
	const row = await orm.role.create({
		data: {
			name: data.name || 'User',
			description: data.description || 'Default user role',
		},
	})
	return Role.restore(row.id, row.name, row.description)
}
