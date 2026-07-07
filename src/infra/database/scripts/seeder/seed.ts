import seedRBAC from './seedRBAC'
import { prisma } from '../../prisma'

seedRBAC(prisma)
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
