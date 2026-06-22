import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type Role from '#domain/rbac/role/Role.js'

class RoleRepositoryMemory implements RoleRepository {
	public roles: Role[] = []

	public constructor(initialRoles: Role[] = []) {
		this.roles = initialRoles
	}

	public findRoleByName(roleName: string): Promise<Role | null> {
		const foundRole = this.roles.find((role) => role.name === roleName)
		if (!foundRole) {
			return Promise.resolve(null)
		}
		return Promise.resolve(foundRole)
	}

	public create(roleData: Role): Promise<Role> {
		this.roles.push(roleData)
		return Promise.resolve(roleData)
	}

	public listRoles(): Promise<Role[]> {
		return Promise.resolve(this.roles)
	}

	public findRoleById(roleId: string): Promise<Role | null> {
		const foundRole = this.roles.find((role) => role.id === roleId)
		if (!foundRole) {
			return Promise.resolve(null)
		}
		return Promise.resolve(foundRole)
	}

	public updateRole(roleData: Role): Promise<Role | null> {
		const roleIndex = this.roles.findIndex((role) => role.id === roleData.id)
		if (roleIndex === -1) {
			return Promise.resolve(null)
		}
		this.roles[roleIndex] = roleData
		return Promise.resolve(roleData)
	}

	public deleteRole(roleId: string): Promise<Role | null> {
		const roleToDelete = this.roles.find((role) => role.id === roleId)
		if (!roleToDelete) {
			return Promise.resolve(null)
		}
		this.roles = this.roles.filter((role) => role.id !== roleId)
		return Promise.resolve(roleToDelete)
	}
}

export default RoleRepositoryMemory
