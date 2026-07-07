import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'

class UpdateOperationUseCase {
	public constructor(
		private readonly operationRepository: OperationRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const operationToUpdate = await this.operationRepository.findOperationByName(input.nameOperationToUpdate)
		if (!operationToUpdate) {
			this.loggerService.warn(`Operation with name ${input.nameOperationToUpdate} not found`, {
				origin: 'UpdateOperationUseCase',
			})
			throw new ResourceNotFoundError('Operation not found')
		}
		operationToUpdate.updateData({
			name: input.name,
			description: input.description,
		})
		const updatedOperation = await this.operationRepository.update(operationToUpdate)
		return {
			id: updatedOperation!.id,
			name: updatedOperation!.name.value,
			description: updatedOperation!.description,
		}
	}
}

export default UpdateOperationUseCase

type Input = {
	nameOperationToUpdate: string
	name: string
	description: string | null
}

type Output = {
	id: string
	name: string
	description: string | null
}
