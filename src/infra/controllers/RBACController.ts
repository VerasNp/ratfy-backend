import type { HttpServerPort } from "#infra/http/HttpServerPort.js";

class RBACController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly getRBACConfigUseCase: GetRBACConfigUseCase,
		private readonly getPermissionsUseCase: GetPermissionsUseCase
	) {
		this.httpServer.register("get", "/rbac/config", async (_params: any, _body: any, _query: any) => {
			const rbacConfig = await this.getRBACConfigUseCase.execute();
			return { rbacConfig };
		})
	}
}

export default RBACController
