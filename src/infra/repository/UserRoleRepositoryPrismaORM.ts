import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class UserRoleRepositoryPrismaORM implements UserRoleRepository {
	public constructor(private readonly orm: PrismaClient) {}

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
