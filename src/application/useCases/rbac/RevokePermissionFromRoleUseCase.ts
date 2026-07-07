import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'

class RevokePermissionFromRoleUseCase {
	public constructor(
		private readonly roleRepository: RoleRepository,
		private readonly permissionRepository: PermissionRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(roleId: string, permissionId: string): Promise<Output> {
		const role = await this.roleRepository.findRoleById(roleId)
		if (!role) {
			this.loggerService.warn(`Role with id ${roleId} not found`, {
				origin: 'RevokePermissionFromRoleUseCase',
			})
			throw new ResourceNotFoundError('Role not found')
		}
		const permission = await this.permissionRepository.findPermissionById(permissionId)
		if (!permission) {
			this.loggerService.warn(`Permission with id ${permissionId} not found`, {
				origin: 'RevokePermissionFromRoleUseCase',
			})
			throw new ResourceNotFoundError('Permission not found')
		}
		role.removePermission(permission)
		await this.roleRepository.updateRole(role)
		this.loggerService.info(
			`Permission with id ${permissionId} revoked from role with id ${roleId}`,
			{
				origin: 'RevokePermissionFromRoleUseCase',
			},
		)
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

export default RevokePermissionFromRoleUseCase

type Output = {
	roleId: string
	roleName: string
	permission: {
		id: string
		label: string
	}
}
