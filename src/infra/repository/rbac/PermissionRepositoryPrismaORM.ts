import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import Operation from '#domain/rbac/operation/Operation.js'
import Permission from '#domain/rbac/permission/Permission.js'
import Resource from '#domain/rbac/resource/Resource.js'
import { Prisma, type PrismaClient } from '#prisma/client.js'

class PermissionRepositoryPrismaORM implements PermissionRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async createPermission(permission: Permission): Promise<void> {
		await this.orm.permission.create({
			data: {
				id: permission.id,
				operationId: permission.operation.id,
				resourceId: permission.resource.id,
			},
		})
	}

	public async deletePermission(permissionId: string): Promise<void> {
		try {
			await this.orm.permission.delete({
				where: {
					id: permissionId,
				},
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return
			}
			throw error
		}
	}

	public async findPermissionById(permissionId: string): Promise<Permission | null> {
		const foundPermission = await this.orm.permission.findUnique({
			where: {
				id: permissionId,
			},
			include: {
				operation: true,
				resource: true,
			},
		})
		if (!foundPermission) {
			return null
		}
		const permission = Permission.restore(
			foundPermission.id,
			Operation.restore(foundPermission.operation.id, foundPermission.operation.name),
			Resource.restore(foundPermission.resource.id, foundPermission.resource.name),
		)
		return permission
	}

	public async findPermissionByOperationIdAndResourceId(
		operationId: string,
		resourceId: string,
	): Promise<Permission | null> {
		const foundPermission = await this.orm.permission.findUnique({
			where: {
				resourceId_operationId: {
					operationId,
					resourceId,
				},
			},
			include: {
				operation: true,
				resource: true,
			},
		})
		if (!foundPermission) {
			return null
		}
		const permission = Permission.restore(
			foundPermission.id,
			Operation.restore(foundPermission.operation.id, foundPermission.operation.name),
			Resource.restore(foundPermission.resource.id, foundPermission.resource.name),
		)
		return permission
	}

	public async listPermissions(): Promise<Permission[]> {
		const foundPermissions = await this.orm.permission.findMany({
			include: {
				operation: true,
				resource: true,
			},
		})
		const permissions = foundPermissions.map((foundPermission) =>
			Permission.restore(
				foundPermission.id,
				Operation.restore(foundPermission.operation.id, foundPermission.operation.name),
				Resource.restore(foundPermission.resource.id, foundPermission.resource.name),
			),
		)
		return permissions
	}

	public async listPermissionsByOperationId(operationId: string): Promise<Permission[]> {
		const foundPermissions = await this.orm.permission.findMany({
			where: {
				operationId,
			},
			include: {
				operation: true,
				resource: true,
			},
		})
		const permissions = foundPermissions.map((foundPermission) =>
			Permission.restore(
				foundPermission.id,
				Operation.restore(foundPermission.operation.id, foundPermission.operation.name),
				Resource.restore(foundPermission.resource.id, foundPermission.resource.name),
			),
		)
		return permissions
	}

	public async listPermissionsByResourceId(resourceId: string): Promise<Permission[]> {
		const foundPermissions = await this.orm.permission.findMany({
			where: {
				resourceId,
			},
			include: {
				operation: true,
				resource: true,
			},
		})
		const permissions = foundPermissions.map((foundPermission) =>
			Permission.restore(
				foundPermission.id,
				Operation.restore(foundPermission.operation.id, foundPermission.operation.name),
				Resource.restore(foundPermission.resource.id, foundPermission.resource.name),
			),
		)
		return permissions
	}
}

export default PermissionRepositoryPrismaORM
