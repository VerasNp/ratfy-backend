import type { PermissionRepository } from '#application/ports/PermissionRepository.js'

class GetPermissionsUseCase {
	public constructor(private readonly permissionRepository: PermissionRepository) {}

	public async execute(): Promise<GetPermissionsUseCaseOutputDTO[]> {
		const foundPermissions = await this.permissionRepository.listPermissions()
		return foundPermissions.map((permission) => ({
			id: permission.id,
			label: permission.label,
			operation: {
				id: permission.operation.id,
				name: permission.operation.name.value,
			},
			resource: {
				id: permission.resource.id,
				name: permission.resource.name.value,
			},
		}))
	}
}

export default GetPermissionsUseCase

type GetPermissionsUseCaseOutputDTO = {
	id: string
	label: string
	operation: { id: string; name: string }
	resource: { id: string; name: string }
}
