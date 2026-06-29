import type { OperationRepository } from '#application/ports/OperationRepository.js'

class GetPermissionsUseCase {
	public constructor(private readonly permissionRepository: OperationRepository) {}

	public async execute(): Promise<GetPermissionsUseCaseOutputDTO[]> {
		const foundPermissions = await this.permissionRepository.listPermissions()
		const permissions = foundPermissions.map((permission) => ({
			permissionId: permission.id,
			name: permission.name,
			description: permission.description,
		}))
		return permissions
	}
}

export default GetPermissionsUseCase

type GetPermissionsUseCaseOutputDTO = {
	permissionId: string
	name: string
	description: string | null
}
