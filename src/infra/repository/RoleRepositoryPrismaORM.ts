import type { RoleRepository } from '#application/ports/RoleRepository.js'
import Role from '#domain/rbac/role/Role.js'
import { Prisma, type PrismaClient } from '../../../prisma/generated/prisma/client'

class RoleRepositoryPrismaORM implements RoleRepository {
	public constructor(private readonly orm: PrismaClient) {}

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
				name: roleData.name,
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
			const updatedRole = await this.orm.role.update({
				where: {
					id: roleData.id,
				},
				data: {
					name: roleData.name,
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
