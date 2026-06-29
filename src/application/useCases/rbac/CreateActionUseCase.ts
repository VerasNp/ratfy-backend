import type { ActionDTO } from '#application/DTOs/rbac/ActionDTO.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { ActionRepository } from '#application/ports/ActionRepository.js'
import Action from '#domain/rbac/action/Action.js'

class CreateActionUseCase {
	public constructor(private readonly actionRepository: ActionRepository) {}

	public async execute(input: ActionDTO): Promise<ActionDTO> {
		const foundAction = await this.actionRepository.findActionByPermissionIdAndResourceId(
			input.permissionId,
			input.resourceId,
		)
		if (foundAction) {
			throw new ResourceAlreadyExistsError()
		}
		const actionToCreate = Action.create(input.resourceId, input.permissionId)
		await this.actionRepository.assignPermissionToResource(actionToCreate)
		return actionToCreate
	}
}

export default CreateActionUseCase
