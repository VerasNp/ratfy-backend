import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import Operation from '#domain/rbac/operation/Operation.js'

class CreateOperationUseCase {
	public constructor(
		private readonly operationRepository: OperationRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(input: Input): Promise<Output> {
		const operationToCreate = Operation.create(input.name, input.description ?? null)
		const existingOperation = await this.operationRepository.findOperationByName(input.name)
		if (existingOperation) {
			throw new ResourceAlreadyExistsError(`Operation with name ${input.name} already exists`)
		}
		const createdOperation = await this.operationRepository.create(operationToCreate)
		this.loggerService.info(`Operation created with id: ${createdOperation.id}`, {
			origin: 'CreateOperationUseCase',
		})
		return {
			id: createdOperation.id,
			name: createdOperation.name.value,
			description: createdOperation.description,
		}
	}
}

export default CreateOperationUseCase

type Input = {
	name: string
	description: string | null
}

type Output = {
	id: string
	name: string
	description: string | null
}
