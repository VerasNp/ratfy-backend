import type { PrismaClient } from '#prisma/client'

export default async function seedRBAC(prisma: PrismaClient) {
	await prisma.role.createMany({
		data: [{ name: 'ADMIN' }, { name: 'USER' }, { name: 'ARTIST' }],
	})

	const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
	const userRole = await prisma.role.findUnique({ where: { name: 'USER' } })
	const artistRole = await prisma.role.findUnique({ where: { name: 'ARTIST' } })

	await prisma.operation.createMany({
		data: [{ name: 'CREATE' }, { name: 'READ' }, { name: 'UPDATE' }, { name: 'DELETE' }],
	})

	const createOperation = await prisma.operation.findUnique({ where: { name: 'CREATE' } })
	const readOperation = await prisma.operation.findUnique({ where: { name: 'READ' } })
	const updateOperation = await prisma.operation.findUnique({ where: { name: 'UPDATE' } })
	const deleteOperation = await prisma.operation.findUnique({ where: { name: 'DELETE' } })

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

	await prisma.permission.createMany({
		data: [
			{ resourceId: userResource!.id, operationId: createOperation!.id },
			{ resourceId: userResource!.id, operationId: readOperation!.id },
			{ resourceId: userResource!.id, operationId: updateOperation!.id },
			{ resourceId: userResource!.id, operationId: deleteOperation!.id },
			{ resourceId: artistResource!.id, operationId: createOperation!.id },
			{ resourceId: artistResource!.id, operationId: readOperation!.id },
			{ resourceId: artistResource!.id, operationId: updateOperation!.id },
			{ resourceId: artistResource!.id, operationId: deleteOperation!.id },
			{ resourceId: albumResource!.id, operationId: createOperation!.id },
			{ resourceId: albumResource!.id, operationId: readOperation!.id },
			{ resourceId: albumResource!.id, operationId: updateOperation!.id },
			{ resourceId: albumResource!.id, operationId: deleteOperation!.id },
			{ resourceId: trackResource!.id, operationId: createOperation!.id },
			{ resourceId: trackResource!.id, operationId: readOperation!.id },
			{ resourceId: trackResource!.id, operationId: updateOperation!.id },
			{ resourceId: trackResource!.id, operationId: deleteOperation!.id },
			{ resourceId: playlistResource!.id, operationId: createOperation!.id },
			{ resourceId: playlistResource!.id, operationId: readOperation!.id },
			{ resourceId: playlistResource!.id, operationId: updateOperation!.id },
			{ resourceId: playlistResource!.id, operationId: deleteOperation!.id },
		],
	})
}
