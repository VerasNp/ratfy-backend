import type { RoleRepository } from '#application/ports/RoleRepository.js'
import Role from '#domain/rbac/role/Role.js'
import { Prisma, type PrismaClient } from '#prisma/client'

class RoleRepositoryPrismaORM implements RoleRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async findRoleWithActionsById(roleId: string): Promise<Role | null> {
		const roleFound = await this.orm.role.findUnique({
			where: {
				id: roleId,
			},
			include: {
				actionsRoles: {
					include: {
						action: true,
					},
				},
			},
		})
		if (!roleFound) {
			return null
		}
		const actions = new Set(
			roleFound.actionsRoles.map(
				(actionRole) => `${actionRole.action.resourceId}:${actionRole.action.permissionId}`,
			),
		)
		const role = Role.restore(roleFound.id, roleFound.name, roleFound.description, actions)
		return role
	}

	public async findRoleByName(roleName: string): Promise<Role | null> {
		const foundRole = await this.orm.role.findUnique({
			where: {
				name: roleName,
			},
		})
		if (!foundRole) {
			return null
		}
		const role = Role.restore(foundRole.id, foundRole.name, foundRole.description)
		return role
	}

	public async create(roleData: Role): Promise<Role> {
		const createdRole = await this.orm.role.create({
			data: {
				id: roleData.id,
				name: roleData.name.value,
				description: roleData.description,
			},
		})
		const role = Role.restore(createdRole.id, createdRole.name, createdRole.description)
		return role
	}

	public async listRoles(): Promise<Role[]> {
		const rolesFound = await this.orm.role.findMany()
		const roles = rolesFound.map((role) => Role.restore(role.id, role.name, role.description))
		return roles
	}

	public async findRoleById(roleId: string): Promise<Role | null> {
		const roleFound = await this.orm.role.findUnique({
			where: {
				id: roleId,
			},
		})
		if (!roleFound) {
			return null
		}
		const role = Role.restore(roleFound.id, roleFound.name, roleFound.description)
		return role
	}

	public async updateRole(roleData: Role): Promise<Role | null> {
		try {
			const currentActionRoles = await this.orm.actionRole.findMany({
				where: { roleId: roleData.id },
				include: { action: true },
			})
			const currentKeys = new Set(
				currentActionRoles.map((ar) => `${ar.action.resourceId}:${ar.action.permissionId}`),
			)
			const desiredKeys = roleData.actions
			const toAdd = [...desiredKeys].filter((key) => !currentKeys.has(key))
			const toRemove = [...currentKeys].filter((key) => !desiredKeys.has(key))
			const actionsToAdd = await Promise.all(
				toAdd.map(async (key) => {
					const [resourceId, permissionId] = key.split(':')
					const action = await this.orm.action.findFirst({
						where: {
							resourceId: resourceId!,
							permissionId: permissionId!,
						},
					})
					if (!action) throw new NotFoundError(`Action not found for ${key}`)
					return action.id
				}),
			)

			const updatedRole = await this.orm.role.update({
				where: {
					id: roleData.id,
				},
				data: {
					name: roleData.name.value,
					description: roleData.description,
				},
			})
			const role = Role.restore(updatedRole.id, updatedRole.name, updatedRole.description)
			return role
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}

	public async deleteRole(roleId: string): Promise<Role | null> {
		try {
			const deletedRole = await this.orm.role.delete({
				where: {
					id: roleId,
				},
			})
			const role = Role.restore(deletedRole.id, deletedRole.name, deletedRole.description)
			return role
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}
}

export default RoleRepositoryPrismaORM
