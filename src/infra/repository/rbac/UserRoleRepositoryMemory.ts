import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import Role from '#domain/rbac/role/Role.js'

class UserRoleRepositoryMemory implements UserRoleRepository {
	public usersRoles: { userId: string; roleId: string }[] = []
	private roles: Role[] = []

	public constructor(
		initialRoles: Role[] = [],
		initialUsersRoles: { userId: string; roleId: string }[] = [],
	) {
		this.roles = initialRoles
		this.usersRoles = initialUsersRoles
	}

	public findRolesByUserId(userId: string): Promise<Role[]> {
		const foundRoles = this.usersRoles.filter((userRole) => userRole.userId === userId)
		const roles = foundRoles.map((userRole) => {
			const role = this.roles.find((role) => role.id === userRole.roleId)
			return role!
		})
		return Promise.resolve(roles)
	}

	public assignRoleToUser(userId: string, roleId: string): Promise<void> {
		this.usersRoles.push({ userId, roleId })
		return Promise.resolve()
	}

	public removeRoleFromUser(userId: string, roleId: string): Promise<void> {
		this.usersRoles = this.usersRoles.filter(
			(userRole) => !(userRole.userId === userId && userRole.roleId === roleId),
		)
		return Promise.resolve()
	}
}

export default UserRoleRepositoryMemory
