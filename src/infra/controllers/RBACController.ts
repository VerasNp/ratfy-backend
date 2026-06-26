import { RoleSchema } from '#application/DTOs/rbac/RoleDTO.js'
import type CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import type UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

class RBACController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly createRoleUseCase: CreateRoleUseCase,
		private readonly updateRoleUseCase: UpdateRoleUseCase
	) {
		this.httpServer.register(
			'get',
			'/rbac/config',
			async (_params: any, _body: any, _query: any) => {},
		)

		this.httpServer.register(
			'put',
			'/rbac/roles/:roleId',
			async (params: any, body: any, _query: any) => {
				const { roleId } = params
				const roleBody = RoleSchema.parse(body)
				this.updateRoleUseCase.execute(roleId, roleBody)
			},
		)

		this.httpServer.register(
			'post',
			'/rbac/roles',
			async (_params: any, body: any, _query: any) => {
				const role = RoleSchema.parse(body)
				await this.createRoleUseCase.execute(role)
			},
		)
	}
}

export default RBACController
