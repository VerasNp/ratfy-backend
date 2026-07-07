import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'

class GrantPermissionToRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly permissionRepository: PermissionRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(roleId: string, permissionId: string): Promise<Output> {
		const role = await this.roleRepository.findRoleById(roleId)
		if (!role) {
			this.loggerService.warn(`Role with id ${roleId} not found`, {
				origin: 'GrantPermissionToRoleUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		const permission = await this.permissionRepository.findPermissionById(permissionId)
		if (!permission) {
			this.loggerService.warn(`Permission with id ${permissionId} not found`, {
				origin: 'GrantPermissionToRoleUseCase',
			})
			throw new ResourceNotFoundError('Permission not found')
		}
		role.assignPermission(permission)
		await this.roleRepository.updateRole(role)
		return {
			roleId: role.id,
			roleName: role.name.value,
			permission: {
				id: permission.id,
				label: `${permission.operation.name.value}:${permission.resource.name.value}`,
			},
		}
	}
}

export default GrantPermissionToRoleUseCase

type Output = {
	roleId: string
	roleName: string
	permission: {
		id: string
		label: string
	}
}
