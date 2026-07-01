import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'

class UpdateResourceUseCase {
	public constructor(
		private readonly resourceRepository: ResourceRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const resourceToUpdate = await this.resourceRepository.findResourceByName(
			input.nameResourceToUpdate,
		)
		if (!resourceToUpdate) {
			this.loggerService.warn(`Resource with name ${input.nameResourceToUpdate} not found`, {
				origin: 'UpdateResourceUseCase',
			})
			throw new ResourceNotFoundError('Resource not found')
		}
		const foundResourceWithNewName = await this.resourceRepository.findResourceByName(
			input.name,
		)
		if (foundResourceWithNewName && foundResourceWithNewName.id !== resourceToUpdate.id) {
			this.loggerService.warn(
				`Resource with name ${input.name} already exists and cannot be used for update`,
				{
					origin: 'UpdateResourceUseCase',
				},
			)
			throw new ResourceAlreadyExistsError('Resource with the same name already exists')
		}
		resourceToUpdate.updateData({
			name: input.name,
		})
		const updatedResource = await this.resourceRepository.updateResource(resourceToUpdate)
		return {
			id: updatedResource!.id,
			name: updatedResource!.name.value,
		}
	}
}

export default UpdateResourceUseCase

type Input = {
	nameResourceToUpdate: string
	name: string
}

type Output = {
	id: string
	name: string
}
