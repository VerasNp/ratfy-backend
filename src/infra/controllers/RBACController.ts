import type { HttpServerPort } from "#infra/http/HttpServerPort.js";

class RBACController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly listPermissionsUseCase: ListPermissionsUseCase
	) {
		this.httpServer.register("get", "/rbac/permissions", async (_params: any, _body: any, _query: any) => {
			const permissions = await
		})
	}
}

export default RBACController
