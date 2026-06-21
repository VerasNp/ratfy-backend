import type { RoleRepository } from '#application/ports/RoleRepository.js'
import Role from '#domain/rbac/role/Role.js'
import { Prisma, type PrismaClient } from '../../../prisma/generated/prisma/client'

class RoleRepositoryPrismaORM implements RoleRepository {
	public constructor(private readonly prismaClient: PrismaClient) {}

	public async create(roleData: Role): Promise<Role> {
		const createdRole = await this.prismaClient.role.create({
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
		const rolesFound = await this.prismaClient.role.findMany()
		const roles = rolesFound.map((role) => Role.restore(role.id, role.name, role.description))
		return roles
	}

	public async getRoleById(roleId: string): Promise<Role | null> {
		const roleFound = await this.prismaClient.role.findUnique({
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
			const updatedRole = await this.prismaClient.role.update({
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
			const deletedRole = await this.prismaClient.role.delete({
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
