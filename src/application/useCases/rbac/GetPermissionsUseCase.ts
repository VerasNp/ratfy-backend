import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'

class GetPermissionsUseCase {
	public constructor(
		private readonly permissionRepository: PermissionRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(): Promise<Output[]> {
		const foundPermissions = await this.permissionRepository.listPermissions()
		if (foundPermissions.length === 0) {
			this.loggerService.warn('No permissions found', {
				origin: 'GetPermissionsUseCase',
			})
		}
		this.loggerService.info(`${foundPermissions.length} permissions retrieved`, {
			origin: 'GetPermissionsUseCase',
		})
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

type Output = {
	id: string
	label: string
	operation: { id: string; name: string }
	resource: { id: string; name: string }
}
