import Operation from '#domain/rbac/operation/Operation.js'
import Permission from '#domain/rbac/permission/Permission.js'
import Resource from '#domain/rbac/resource/Resource.js'
import Role from '#domain/rbac/role/Role.js'
import type { PrismaClient } from '#prisma/client'

export function createDummyOperation(data: any = {}): Operation {
	return Operation.create(
		data.name !== undefined ? data.name : 'TEST_OPERATION',
		data.description !== undefined ? data.description : null,
	)
}

export async function createDummyOperationPrismaORM(
	orm: PrismaClient,
	data: any = {},
): Promise<Operation> {
	const row = await orm.operation.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'TEST_OPERATION',
			description: data.description !== undefined ? data.description : null,
		},
	})
	return Operation.restore(row.id, row.name, row.description)
}

export function createDummyResource(data: any = {}): Resource {
	return Resource.create(data.name !== undefined ? data.name : 'TEST_RESOURCE')
}

export async function createDummyResourcePrismaORM(
	orm: PrismaClient,
	data: any = {},
): Promise<Resource> {
	const row = await orm.resource.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'TEST_RESOURCE',
		},
	})
	return Resource.restore(row.id, row.name)
}

export function createDummyPermission(
	operation: Operation = createDummyOperation(),
	resource: Resource = createDummyResource(),
): Permission {
	return Permission.create(operation, resource)
}

export async function createDummyPermissionPrismaORM(
	orm: PrismaClient,
	data: {
		operationId: string
		resourceId: string
	} & any = {} as any,
): Promise<Permission> {
	const row = await orm.permission.create({
		data: {
			id: data.id || crypto.randomUUID(),
			operationId: data.operationId,
			resourceId: data.resourceId,
		},
		include: { operation: true, resource: true },
	})
	return Permission.restore(
		row.id,
		Operation.restore(row.operation.id, row.operation.name),
		Resource.restore(row.resource.id, row.resource.name),
	)
}

export function createDummyRole(data: any = {}): Role {
	return Role.create(
		data.name !== undefined ? data.name : 'TEST_ROLE',
		data.description !== undefined ? data.description : null,
		data.permissions || [],
	)
}

export async function createDummyRolePrismaORM(
	orm: PrismaClient,
	data: any = {},
): Promise<Role> {
	const row = await orm.role.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'TEST_ROLE',
			description: data.description !== undefined ? data.description : null,
		},
	})
	return Role.restore(row.id, row.name, row.description)
}
