import GetAccountUseCase from '#application/useCases/GetAccountUseCase.js'
import LoginUseCase from '#application/useCases/LoginUseCase.js'
import LogoutUseCase from '#application/useCases/LogoutUseCase.js'
import RefreshTokenUseCase from '#application/useCases/RefreshTokenUseCase.js'
import ResendVerificationEmailUseCase from '#application/useCases/ResendVerificationEmailUseCase.js'
import SignupUseCase from '#application/useCases/SignupUseCase.js'
import VerifyUserMailUseCase from '#application/useCases/VerifyUserMailUseCase.js'
import { config } from '#config.js'
import AuthController from '#infra/controllers/AuthController.js'
import UserController from '#infra/controllers/UserController.js'
import VerifyEmailController from '#infra/controllers/VerifyEmailController.js'
import { prisma } from '#infra/database/prisma.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import PinoAdapter from '#infra/logger/PinoAdapter.js'
import NodemailerAdapter from '#infra/mail/NodemailerAdapter.js'
import RefreshTokenRepositoryPrismaORM from '#infra/repository/RefreshTokenRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import Argon2Adapter from '#infra/security/Argon2Adapter.js'
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
	hashService: asClass(Argon2Adapter).singleton(),

	// repositories
	userRepository: asClass(UserRepositoryPrismaORM).singleton(),
	refreshTokenRepository: asClass(RefreshTokenRepositoryPrismaORM).singleton(),

	// use cases
	signUpUserCase: asClass(SignupUseCase).scoped(),
	verifyUserMailUserCase: asClass(VerifyUserMailUseCase).scoped(),
	resendVerificationEmailUserCase: asClass(ResendVerificationEmailUseCase).scoped(),
	loginUseCase: asClass(LoginUseCase).scoped(),
	logoutUseCase: asClass(LogoutUseCase).scoped(),
	getAccountUseCase: asClass(GetAccountUseCase).scoped(),
	refreshTokenUseCase: asClass(RefreshTokenUseCase).scoped(),

	// controller
	userController: asClass(UserController).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),
	authController: asClass(AuthController).singleton(),

	// middlewares
	authMiddleware: asClass(AuthMiddleware).singleton(),
})

export default container
