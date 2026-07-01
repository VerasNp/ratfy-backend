import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import Resource from '#domain/rbac/resource/Resource.js'

class CreateResourceUseCase {
	public constructor(
		private readonly resourceRepository: ResourceRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const resourceToBeCreated = Resource.create(input.name)
		const foundResource = await this.resourceRepository.findResourceByName(
			resourceToBeCreated.name.value,
		)
		if (foundResource) {
			this.loggerService.warn(
				`Resource with name ${resourceToBeCreated.name.value} already exists`,
				{
					origin: 'CreateResourceUseCase',
				},
			)
			throw new ResourceAlreadyExistsError('Resource with the same name already exists')
		}
		const createdResource = await this.resourceRepository.create(resourceToBeCreated)
		this.loggerService.info(
			`Resource with name ${createdResource.name.value} created successfully`,
			{
				origin: 'CreateResourceUseCase',
			},
		)
		return {
			id: createdResource.id,
			name: createdResource.name.value,
		}
	}
}

export default CreateResourceUseCase

type Input = {
	name: string
}

type Output = {
	id: string
	name: string
}
