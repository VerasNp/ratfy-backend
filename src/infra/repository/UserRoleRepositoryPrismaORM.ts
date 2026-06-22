import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import Role from '#domain/rbac/role/Role.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class UserRoleRepositoryPrismaORM implements UserRoleRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async findRolesByUserId(userId: string): Promise<Role[]> {
		const foundRoles = await this.orm.usersRoles.findMany({
			where: { userId },
			include: { role: true },
		})
		const roles = foundRoles.map((foundRole) =>
			Role.restore(foundRole.role.id, foundRole.role.name, foundRole.role.description),
		)
		return roles
	}

	public async assignRoleToUser(userId: string, roleId: string): Promise<void> {
		await this.orm.usersRoles.create({
			data: {
				userId,
				roleId,
			},
		})
	}

	public async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
		await this.orm.usersRoles.delete({
			where: {
				userId_roleId: {
					userId,
					roleId,
				},
			},
		})
	}
}

export default UserRoleRepositoryPrismaORM
