import type Resource from "#domain/rbac/resource/Resource.js"

export interface ResourceRepository {
	/**
	 * Creates a resource
	 * @param resourceData
	 */
	create(resourceData: Resource): Promise<Resource>
	/**
	 * List all resources
	 */
	listResources(): Promise<Resource[]>
	/**
	 * Get a resource by its unique identifier
	 * @param resourceId The unique identifier of the resource
	 */
	findResourceById(resourceId: string): Promise<Resource | null>
	/**
	 * Updates resource data
	 * @param resourceData Resource data updated
	 */
	updateResource(resourceData: Resource): Promise<Resource | null>
	/**
	 * Deletes a resource
	 * @param resourceId The unique identifier of the resource
	 */
	deleteResource(resourceId: string): Promise<Resource | null>
}
