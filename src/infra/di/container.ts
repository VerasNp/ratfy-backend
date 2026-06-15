import ResendVerificationEmail from '#application/useCases/ResendVerificationEmail.js'
import Signup from '#application/useCases/Signup.js'
import VerifyUserMail from '#application/useCases/VerifyUserMail.js'
import { config } from '#config.js'
import UserController from '#infra/controllers/UserController.js'
import VerifyEmailController from '#infra/controllers/VerifyEmailController.js'
import { prisma } from '#infra/database/prisma.js'
import SwaggerDocs from '#infra/docs/SwaggerDocs.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import PinoAdapter from '#infra/logger/PinoAdapter.js'
import NodemailerAdapter from '#infra/mail/NodemailerAdapter.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import JwtAdapter from '#infra/security/JwtAdapter.js'
import HandlebarsRendererAdapter from '#infra/templateRenderer/HandlebarsRendererAdapter.js'
import ArtistRepositoryPrisma from '#infra/repository/ArtistRepositoryPrisma.js'
import { CreateArtistUseCase } from '#application/useCases/artist/CreateArtist.js'
import { DeleteArtistUseCase } from '#application/useCases/artist/DeleteArtist.js'
import { GetArtistUseCase } from '#application/useCases/artist/GetArtist.js'
import { GetArtistByUserIdUseCase } from '#application/useCases/artist/GetArtistByUserId.js'
import { ListArtistsUseCase } from '#application/useCases/artist/ListArtists.js'
import { UpdateArtistUseCase } from '#application/useCases/artist/UpdateArtist.js'
import ArtistController from '#infra/controllers/ArtistController.js'
import { asClass, asValue, createContainer, InjectionMode } from 'awilix'

const container = createContainer({ injectionMode: InjectionMode.CLASSIC })

container.register({
	// config
	appUrl: asValue(config.app.url),
	port: asValue(config.app.port),
	nodeEnv: asValue(config.app.nodeEnv),
	databaseUrl: asValue(config.database.url),
	jwtSecret: asValue(config.jwt.secret),
	smtpConfig: asValue(config.mail),
	templatesDir: asValue(config.templates.dir),

	// infra
	orm: asValue(prisma),
	httpServer: asClass(ExpressAdapter).singleton(),
	templateRendererService: asClass(HandlebarsRendererAdapter).singleton(),
	tokenService: asClass(JwtAdapter).singleton(),
	mailService: asClass(NodemailerAdapter).singleton(),
	loggerService: asClass(PinoAdapter).singleton(),
	docsService: asClass(SwaggerDocs).singleton(),

	// repositories
	userRepository: asClass(UserRepositoryPrismaORM).singleton(),
	artistRepo: asClass(ArtistRepositoryPrisma).singleton(),

	// use cases
	signUpUserCase: asClass(Signup).scoped(),
	verifyUserMailUserCase: asClass(VerifyUserMail).scoped(),
	resendVerificationEmailUserCase: asClass(ResendVerificationEmail).scoped(),
	createArtistUseCase: asClass(CreateArtistUseCase).scoped(),
	getArtistUseCase: asClass(GetArtistUseCase).scoped(),
	updateArtistUseCase: asClass(UpdateArtistUseCase).scoped(),
	deleteArtistUseCase: asClass(DeleteArtistUseCase).scoped(),
	listArtistsUseCase: asClass(ListArtistsUseCase).scoped(),
	getArtistByUserIdUseCase: asClass(GetArtistByUserIdUseCase).scoped(),

	// controller
	userController: asClass(UserController).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),
	artistController: asClass(ArtistController).singleton(),
})

export default container
