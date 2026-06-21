import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import Permission from '#domain/rbac/permission/Permission.js'
import { Prisma, type PrismaClient } from '../../../prisma/generated/prisma/client'

class PermissionRepositoryPrismaORM implements PermissionRepository {
	public constructor(private readonly prismaClient: PrismaClient) {}

	public async create(permissionData: Permission): Promise<Permission> {
		const createdPermission = await this.prismaClient.permission.create({
			data: {
				id: permissionData.id,
				name: permissionData.name,
				description: permissionData.description,
			},
		})
		const permission = Permission.restore(
			createdPermission.id,
			createdPermission.name,
			createdPermission.description,
		)
		return permission
	}

	public async listPermissions(): Promise<Permission[]> {
		const permissionsFound = await this.prismaClient.permission.findMany()
		const permissions = permissionsFound.map((permission) =>
			Permission.restore(permission.id, permission.name, permission.description),
		)
		return permissions
	}

	public async getPermissionById(permissionId: string): Promise<Permission | null> {
		const permissionFound = await this.prismaClient.permission.findUnique({
			where: {
				id: permissionId,
			},
		})
		if (!permissionFound) {
			return null
		}
		const permission = Permission.restore(
			permissionFound.id,
			permissionFound.name,
			permissionFound.description,
		)
		return permission
	}

	public async updatePermission(permissionData: Permission): Promise<Permission | null> {
		try {
			const updatedPermission = await this.prismaClient.permission.update({
				where: {
					id: permissionData.id,
				},
				data: {
					name: permissionData.name,
					description: permissionData.description,
				},
			})
			const permission = Permission.restore(
				updatedPermission.id,
				updatedPermission.name,
				updatedPermission.description,
			)
			return permission
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}

	public async deletePermission(permissionId: string): Promise<Permission | null> {
		try {
			const deletedPermission = await this.prismaClient.permission.delete({
				where: {
					id: permissionId,
				},
			})
			const permission = Permission.restore(
				deletedPermission.id,
				deletedPermission.name,
				deletedPermission.description,
			)
			return permission
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}
}

export default PermissionRepositoryPrismaORM
