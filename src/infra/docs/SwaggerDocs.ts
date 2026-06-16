import type { DocsPort } from '#application/ports/DocsPort.js'
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import AuthControllerSwagger from './routes/auth/AuthController.swagger'
import UserControllerSwagger from './routes/user/UserController.swagger'
import VerifyEmailControllerSwagger from './routes/email/VerifyEmailController.swagger'

class SwaggerDocs implements DocsPort {
	private registry: OpenAPIRegistry
	public constructor() {
		this.registry = new OpenAPIRegistry()
		this._registerSecuritySchemes()
		this._registerRoutes()
	}
	public generate(): unknown {
		const generator = new OpenApiGeneratorV3(this.registry.definitions)
		return generator.generateDocument({
			openapi: '3.0.0',
			info: {
				title: 'Ratfy API',
				version: '0.0.0',
				description: 'Ratfy backend API documentation',
			},
			servers: [{ url: '/' }],
		})
	}

	private _registerSecuritySchemes(): void {
		this.registry.registerComponent('securitySchemes', 'bearerAuth', {
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
		})
	}

	private _registerRoutes(): void {
		new AuthControllerSwagger(this.registry)
		new UserControllerSwagger(this.registry)
		new VerifyEmailControllerSwagger(this.registry)
	}
}

export default SwaggerDocs
