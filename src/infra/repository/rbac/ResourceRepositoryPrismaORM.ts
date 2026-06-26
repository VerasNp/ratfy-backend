import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import Resource from '#domain/rbac/resource/Resource.js'
import { Prisma, type PrismaClient } from '#prisma/client'

class ResourceRepositoryPrismaORM implements ResourceRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async create(resourceData: Resource): Promise<Resource> {
		const createdResource = await this.orm.resource.create({
			data: {
				id: resourceData.id,
				name: resourceData.name,
			},
		})
		const resource = Resource.restore(createdResource.id, createdResource.name)
		return resource
	}

	public async listResources(): Promise<Resource[]> {
		const foundResources = await this.orm.resource.findMany()
		const resources = foundResources.map((foundResource) =>
			Resource.restore(foundResource.id, foundResource.name),
		)
		return resources
	}

	public async findResourceById(resourceId: string): Promise<Resource | null> {
		const foundResource = await this.orm.resource.findUnique({
			where: {
				id: resourceId,
			},
		})
		if (!foundResource) {
			return null
		}
		const resource = Resource.restore(foundResource.id, foundResource.name)
		return resource
	}

	public async updateResource(resourceData: Resource): Promise<Resource | null> {
		try {
			const updatedResource = await this.orm.resource.update({
				where: {
					id: resourceData.id,
				},
				data: {
					name: resourceData.name,
				},
			})
			const resource = Resource.restore(updatedResource.id, updatedResource.name)
			return resource
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}

	public async deleteResource(resourceId: string): Promise<Resource | null> {
		try {
			const deletedResource = await this.orm.resource.delete({
				where: {
					id: resourceId,
				},
			})
			const resource = Resource.restore(deletedResource.id, deletedResource.name)
			return resource
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}
}

export default ResourceRepositoryPrismaORM
