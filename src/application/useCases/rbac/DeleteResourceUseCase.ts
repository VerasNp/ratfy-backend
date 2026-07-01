import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'

class DeleteResourceUseCase {
	constructor(
		private readonly resourceRepository: ResourceRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const resourceToDelete = await this.resourceRepository.findResourceByName(
			input.nameResourceToDelete,
		)
		if (!resourceToDelete) {
			this.loggerService.warn(`Resource with name ${input.nameResourceToDelete} not found`, {
				origin: 'DeleteResourceUseCase',
			})
			throw new ResourceNotFoundError('Resource not found')
		}
		const deletedResource = await this.resourceRepository.deleteResource(resourceToDelete.id)
		this.loggerService.info(
			`Resource with name ${input.nameResourceToDelete} deleted successfully`,
			{
				origin: 'DeleteResourceUseCase',
			},
		)
		return {
			id: deletedResource!.id,
			name: deletedResource!.name.value,
		}
	}
}

export default DeleteResourceUseCase

type Input = {
	nameResourceToDelete: string
}

type Output = {
	id: string
	name: string
}
