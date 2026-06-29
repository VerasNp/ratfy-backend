import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import type Resource from '#domain/rbac/resource/Resource.js'

class ResourceRepositoryMemory implements ResourceRepository {
	public resources: Resource[] = []

	public constructor(initialResources: Resource[] = []) {
		this.resources = initialResources
	}

	public create(resourceData: Resource): Promise<Resource> {
		this.resources.push(resourceData)
		return Promise.resolve(resourceData)
	}

	public listResources(): Promise<Resource[]> {
		return Promise.resolve(this.resources)
	}

	public findResourceById(resourceId: string): Promise<Resource | null> {
		const resource = this.resources.find((r) => r.id === resourceId)
		return Promise.resolve(resource || null)
	}

	public updateResource(resourceData: Resource): Promise<Resource | null> {
		const index = this.resources.findIndex((r) => r.id === resourceData.id)
		if (index === -1) {
			return Promise.resolve(null)
		}
		this.resources[index] = resourceData
		return Promise.resolve(resourceData)
	}

	public deleteResource(resourceId: string): Promise<Resource | null> {
		const resourceToDelete = this.resources.find((resource) => resource.id === resourceId)
		if (!resourceToDelete) {
			return Promise.resolve(null)
		}
		this.resources = this.resources.filter((resource) => resource.id !== resourceId)
		return Promise.resolve(resourceToDelete)
	}

	public findResourceByName(resourceName: string): Promise<Resource | null> {
		const resource = this.resources.find((r) => r.name.value === resourceName)
		return Promise.resolve(resource || null)
	}
}

export default ResourceRepositoryMemory
