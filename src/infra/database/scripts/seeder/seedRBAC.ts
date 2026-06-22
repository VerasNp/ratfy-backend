import type { PermissionsResources } from '../../../../../prisma/generated/prisma/browser'
import type { PrismaClient } from '../../../../../prisma/generated/prisma/client'

export default async function seedRBAC(prisma: PrismaClient) {
	await prisma.role.createMany({
		data: [{ name: 'ADMIN' }, { name: 'USER' }, { name: 'ARTIST' }],
	})

	const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
	const userRole = await prisma.role.findUnique({ where: { name: 'USER' } })
	const artistRole = await prisma.role.findUnique({ where: { name: 'ARTIST' } })

	await prisma.permission.createMany({
		data: [{ name: 'CREATE' }, { name: 'READ' }, { name: 'UPDATE' }, { name: 'DELETE' }],
	})

	const createPermission = await prisma.permission.findUnique({ where: { name: 'CREATE' } })
	const readPermission = await prisma.permission.findUnique({ where: { name: 'READ' } })
	const updatePermission = await prisma.permission.findUnique({ where: { name: 'UPDATE' } })
	const deletePermission = await prisma.permission.findUnique({ where: { name: 'DELETE' } })

	await prisma.resource.createMany({
		data: [
			{ name: 'User' },
			{ name: 'Artist' },
			{ name: 'Album' },
			{ name: 'Track' },
			{ name: 'Playlist' },
		],
	})

	const userResource = await prisma.resource.findUnique({ where: { name: 'User' } })
	const artistResource = await prisma.resource.findUnique({ where: { name: 'Artist' } })
	const albumResource = await prisma.resource.findUnique({ where: { name: 'Album' } })
	const trackResource = await prisma.resource.findUnique({ where: { name: 'Track' } })
	const playlistResource = await prisma.resource.findUnique({ where: { name: 'Playlist' } })

	await prisma.permissionsResources.createMany({
		data: [
			{ resourceId: userResource!.id, permissionId: createPermission!.id },
			{ resourceId: userResource!.id, permissionId: readPermission!.id },
			{ resourceId: userResource!.id, permissionId: updatePermission!.id },
			{ resourceId: userResource!.id, permissionId: deletePermission!.id },
			{ resourceId: artistResource!.id, permissionId: createPermission!.id },
			{ resourceId: artistResource!.id, permissionId: readPermission!.id },
			{ resourceId: artistResource!.id, permissionId: updatePermission!.id },
			{ resourceId: artistResource!.id, permissionId: deletePermission!.id },
			{ resourceId: albumResource!.id, permissionId: createPermission!.id },
			{ resourceId: albumResource!.id, permissionId: readPermission!.id },
			{ resourceId: albumResource!.id, permissionId: updatePermission!.id },
			{ resourceId: albumResource!.id, permissionId: deletePermission!.id },
			{ resourceId: trackResource!.id, permissionId: createPermission!.id },
			{ resourceId: trackResource!.id, permissionId: readPermission!.id },
			{ resourceId: trackResource!.id, permissionId: updatePermission!.id },
			{ resourceId: trackResource!.id, permissionId: deletePermission!.id },
			{ resourceId: playlistResource!.id, permissionId: createPermission!.id },
			{ resourceId: playlistResource!.id, permissionId: readPermission!.id },
			{ resourceId: playlistResource!.id, permissionId: updatePermission!.id },
			{ resourceId: playlistResource!.id, permissionId: deletePermission!.id },
		],
	})

	// Assign all permissions to Admin role
	const allPermissionsResources = await prisma.permissionsResources.findMany()
	const adminRolePermissions = allPermissionsResources.map((pr) => ({
		roleId: adminRole!.id,
		permissionOnResourcesId: pr.id,
	}))

	await prisma.rolesPermissions.createMany({
		data: adminRolePermissions,
	})
}
