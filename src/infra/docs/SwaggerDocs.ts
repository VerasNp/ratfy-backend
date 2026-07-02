import type { DocsPort } from '#application/ports/DocsPort.js'
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import AuthControllerSwagger from './routes/auth/AuthController.swagger'

import PasswordResetControllerSwagger from './routes/passwordReset/PasswordResetController.swagger.js'
import PlaylistControllerSwagger from './routes/playlist/PlaylistController.swagger.js'
import UserControllerSwagger from './routes/user/UserController.swagger'
import VerifyEmailControllerSwagger from './routes/email/VerifyEmailController.swagger'
import AlbumControllerSwagger from './routes/album/AlbumController.swagger'
import FavoriteControllerSwagger from './routes/favorite/FavoriteController.swagger'
import TrackControllerSwagger from './routes/track/TrackController.swagger'

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
		new PlaylistControllerSwagger(this.registry)
		new AlbumControllerSwagger(this.registry)
		new FavoriteControllerSwagger(this.registry)
		new UserControllerSwagger(this.registry)
		new VerifyEmailControllerSwagger(this.registry)
		new TrackControllerSwagger(this.registry)
		new PasswordResetControllerSwagger(this.registry)
	}
}

export default SwaggerDocs
