import Action from '#domain/rbac/action/Action.js'
import Operation from '#domain/rbac/operation/Operation.js'
import Resource from '#domain/rbac/resource/Resource.js'
import Role from '#domain/rbac/role/Role.js'
import ActionRepositoryPrismaORM from '#infra/repository/rbac/ActionRepositoryPrismaORM.js'
import ActionRoleRepositoryPrismaORM from '#infra/repository/rbac/ActionRoleRepositoryPrismaORM.js'
import PermissionRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'
import ResourceRepositoryPrismaORM from '#infra/repository/rbac/ResourceRepositoryPrismaORM.js'
import RoleRepositoryPrismaORM from '#infra/repository/rbac/RoleRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const actionRoleRepository = new ActionRoleRepositoryPrismaORM(prisma)
const permissionRepository = new PermissionRepositoryPrismaORM(prisma)
const resourceRepository = new ResourceRepositoryPrismaORM(prisma)
const roleRepository = new RoleRepositoryPrismaORM(prisma)
const actionRepository = new ActionRepositoryPrismaORM(prisma)

let dummyRole: Role
let dummyPermission: Operation
let dummyResource: Resource
let dummyAction: Action

beforeEach(async () => {
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "ActionRole" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Action" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Permission" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Resource" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
	dummyRole = Role.create('ROLE', null)
	dummyRole = await roleRepository.create(dummyRole)
	dummyPermission = Operation.create('PERMISSION', null)
	dummyPermission = await permissionRepository.create(dummyPermission)
	dummyResource = Resource.create('RESOURCE')
	dummyResource = await resourceRepository.create(dummyResource)
	dummyAction = Action.create(dummyResource.id, dummyPermission.id)
	dummyAction = await actionRepository.assignPermissionToResource(dummyAction)
})

describe('ActionRoleRepositoryPrismaORM', () => {
	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should assign an action to a role', async () => {
		await actionRoleRepository.assignActionToRole(dummyAction.id, dummyRole.id)
		const actionRole = await actionRoleRepository.findActionsByRoleId(dummyRole.id)
		expect(actionRole).not.toBeNull()
		expect(actionRole.length).toBe(1)
		expect(actionRole[0]!.id).toBe(dummyAction.id)
	})

	it('should remove an action from a role', async () => {
		await actionRoleRepository.assignActionToRole(dummyAction.id, dummyRole.id)
		await actionRoleRepository.removeActionFromRole(dummyAction.id, dummyRole.id)
		const actionRole = await actionRoleRepository.findActionsByRoleId(dummyRole.id)
		expect(actionRole).toEqual([])
	})
})
