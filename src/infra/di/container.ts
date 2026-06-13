import ResendVerificationEmail from '#application/useCases/ResendVerificationEmail.js'
import Signup from '#application/useCases/Signup.js'
import VerifyUserMail from '#application/useCases/VerifyUserMail.js'
import { config } from '#config.js'
import UserController from '#infra/controllers/UserController.js'
import VerifyEmailController from '#infra/controllers/VerifyEmailController.js'
import { prisma } from '#infra/database/prisma.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import PinoAdapter from '#infra/logger/PinoAdapter.js'
import NodemailerAdapter from '#infra/mail/NodemailerAdapter.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import JwtAdapter from '#infra/security/JwtAdapter.js'
import HandlebarsRendererAdapter from '#infra/templateRenderer/HandlebarsRendererAdapter.js'
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

	// repositories
	userRepository: asClass(UserRepositoryPrismaORM).singleton(),

	// use cases
	signUpUserCase: asClass(Signup).scoped(),
	verifyUserMailUserCase: asClass(VerifyUserMail).scoped(),
	resendVerificationEmailUserCase: asClass(ResendVerificationEmail).scoped(),

	// controller
	userController: asClass(UserController).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),
})

export default container
