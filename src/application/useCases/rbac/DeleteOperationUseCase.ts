import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'

class DeleteOperationUseCase {
	public constructor(
		private readonly operationRepository: OperationRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const operationToDelete = await this.operationRepository.findOperationByName(
			input.operationName,
		)
		if (!operationToDelete) {
			this.loggerService.warn(`Operation with name ${input.operationName} not found`, {
				origin: 'DeleteOperationUseCase',
			})
			throw new ResourceNotFoundError('Operation not found')
		}
		const deletedOperation = await this.operationRepository.deleteOperation(
			operationToDelete.id,
		)
		return {
			id: deletedOperation!.id,
			name: deletedOperation!.name.value,
			description: deletedOperation!.description,
		}
	}
}

export default DeleteOperationUseCase

type Input = {
	operationName: string
}

type Output = {
	id: string
	name: string
	description: string | null
}
