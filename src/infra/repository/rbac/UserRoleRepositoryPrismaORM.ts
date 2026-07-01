import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import Role from '#domain/rbac/role/Role.js'
import type { PrismaClient } from '#prisma/client.js'

class UserRoleRepositoryPrismaORM implements UserRoleRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async findRolesByUserId(userId: string): Promise<Role[]> {
		const foundRoles = await this.orm.userRole.findMany({
			where: { userId },
			include: { role: true },
		})
		return foundRoles.map((foundRole) =>
			Role.restore(foundRole.role.id, foundRole.role.name, foundRole.role.description),
		)
	}

	public async assignRoleToUser(userId: string, roleId: string): Promise<void> {
		await this.orm.userRole.create({
			data: {
				userId,
				roleId,
			},
		})
	}

	public async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
		await this.orm.userRole.delete({
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
