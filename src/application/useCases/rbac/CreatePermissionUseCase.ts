import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import Permission from '#domain/rbac/permission/Permission.js'

class CreatePermissionUseCase {
	public constructor(
		private readonly permissionRepository: PermissionRepository,
		private readonly operationRepository: OperationRepository,
		private readonly resourceRepository: ResourceRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const foundOperation = await this.operationRepository.findOperationById(input.operationId)
		if (!foundOperation) {
			this.loggerService.warn(`Operation with id ${input.operationId} not found`, {
				origin: 'CreatePermissionUseCase',
			})
			throw new ResourceAlreadyExistsError('Operation not found')
		}
		const foundResource = await this.resourceRepository.findResourceById(input.resourceId)
		if (!foundResource) {
			this.loggerService.warn(`Resource with id ${input.resourceId} not found`, {
				origin: 'CreatePermissionUseCase',
			})
			throw new ResourceAlreadyExistsError('Resource not found')
		}
		const foundPermission =
			await this.permissionRepository.findPermissionByOperationIdAndResourceId(
				input.operationId,
				input.resourceId,
			)
		if (foundPermission) {
			this.loggerService.warn(
				`Permission already exists for operation ${input.operationId} and resource ${input.resourceId}`,
				{
					origin: 'CreatePermissionUseCase',
				},
			)
			throw new ResourceAlreadyExistsError(
				'Permission already exists for the given operation and resource.',
			)
		}
		const permissionToCreate = Permission.create(foundOperation, foundResource)
		await this.permissionRepository.createPermission(permissionToCreate)
		this.loggerService.info(
			`Permission created successfully for operation ${input.operationId} and resource ${input.resourceId}`,
			{
				origin: 'CreatePermissionUseCase',
			},
		)
		return {
			id: permissionToCreate.id,
			resource: {
				id: permissionToCreate.resource.id,
				name: permissionToCreate.resource.name.value,
			},
			permission: {
				id: permissionToCreate.operation.id,
				name: permissionToCreate.operation.name.value,
			},
			label: permissionToCreate.label,
		}
	}
}

export default CreatePermissionUseCase

type Input = {
	operationId: string
	resourceId: string
}

type Output = {
	id: string
	resource: {
		id: string
		name: string
	}
	permission: {
		id: string
		name: string
	}
	label: string
}
