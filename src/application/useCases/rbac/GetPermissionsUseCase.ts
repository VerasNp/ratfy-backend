import type { PermissionRepository } from '#application/ports/PermissionRepository.js'

class GetPermissionsUseCase {
	public constructor(private readonly permissionRepository: PermissionRepository) {}

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
