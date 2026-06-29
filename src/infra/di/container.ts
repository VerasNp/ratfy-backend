import GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import LoginUseCase from '#application/useCases/auth/LoginUseCase.js'
import LogoutUseCase from '#application/useCases/auth/LogoutUseCase.js'
import RefreshTokenUseCase from '#application/useCases/auth/RefreshTokenUseCase.js'
import ResendVerificationEmailUseCase from '#application/useCases/auth/ResendVerificationEmailUseCase.js'
import SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import VerifyUserMailUseCase from '#application/useCases/mail/VerifyUserMailUseCase.js'
import { config } from '#config.js'
import AuthController from '#infra/controllers/AuthController.js'
import UserController from '#infra/controllers/UserController.js'
import VerifyEmailController from '#infra/controllers/VerifyEmailController.js'
import { prisma } from '#infra/database/prisma.js'
import SwaggerDocs from '#infra/docs/SwaggerDocs.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import PinoAdapter from '#infra/logger/PinoAdapter.js'
import NodemailerAdapter from '#infra/mail/NodemailerAdapter.js'
import RefreshTokenRepositoryPrismaORM from '#infra/repository/RefreshTokenRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import Argon2Adapter from '#infra/security/Argon2Adapter.js'
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
import PlaylistRepositoryPrisma from '#infra/repository/PlaylistRepositoryPrisma.js'
import { CreatePlaylistUseCase } from '#application/useCases/playlist/CreatePlaylist.js'
import { DeletePlaylistUseCase } from '#application/useCases/playlist/DeletePlaylist.js'
import { GetPlaylistUseCase } from '#application/useCases/playlist/GetPlaylist.js'
import { ListPlaylistsUseCase } from '#application/useCases/playlist/ListPlaylists.js'
import { ListPlaylistsByOwnerIdUseCase } from '#application/useCases/playlist/ListPlaylistsByOwnerId.js'
import { UpdatePlaylistUseCase } from '#application/useCases/playlist/UpdatePlaylist.js'
import { AddTrackToPlaylistUseCase } from '#application/useCases/playlist/AddTrackToPlaylist.js'
import { RemoveTrackFromPlaylistUseCase } from '#application/useCases/playlist/RemoveTrackFromPlaylist.js'
import PlaylistController from '#infra/controllers/PlaylistController.js'
import { asClass, asValue, createContainer, InjectionMode } from 'awilix'
import GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import ListUsersUseCase from '#application/useCases/user/ListUsersUseCase.js'
import UnitOfWorkPrismaORM from '#infra/repository/UnitOfWorkPrismaORM.js'
import PermissionRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'
import ResourceRepositoryPrismaORM from '#infra/repository/rbac/ResourceRepositoryPrismaORM.js'
import RoleRepositoryPrismaORM from '#infra/repository/rbac/RoleRepositoryPrismaORM.js'
import UserRoleRepositoryPrismaORM from '#infra/repository/rbac/UserRoleRepositoryPrismaORM.js'
import RBACController from '#infra/controllers/RBACController.js'
import CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import OperationRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'
import UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'

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
	docsService: asClass(SwaggerDocs).singleton(),

	// repositories
	userRepository: asClass(UserRepositoryPrismaORM).singleton(),
	artistRepository: asClass(ArtistRepositoryPrisma).singleton(),
	playlistRepository: asClass(PlaylistRepositoryPrisma).singleton(),
	refreshTokenRepository: asClass(RefreshTokenRepositoryPrismaORM).singleton(),
	roleRepository: asClass(RoleRepositoryPrismaORM).singleton(),
	permissionRepository: asClass(PermissionRepositoryPrismaORM).singleton(),
	resourceRepository: asClass(ResourceRepositoryPrismaORM).singleton(),
	unitOfWork: asClass(UnitOfWorkPrismaORM).singleton(),
	userRoleRepository: asClass(UserRoleRepositoryPrismaORM).singleton(),
	operationRepository: asClass(OperationRepositoryPrismaORM).singleton(),

	// use cases
	signUpUserCase: asClass(SignupUseCase).scoped(),
	verifyUserMailUserCase: asClass(VerifyUserMailUseCase).scoped(),
	resendVerificationEmailUserCase: asClass(ResendVerificationEmailUseCase).scoped(),
	createArtistUseCase: asClass(CreateArtistUseCase).scoped(),
	getArtistUseCase: asClass(GetArtistUseCase).scoped(),
	updateArtistUseCase: asClass(UpdateArtistUseCase).scoped(),
	deleteArtistUseCase: asClass(DeleteArtistUseCase).scoped(),
	listArtistsUseCase: asClass(ListArtistsUseCase).scoped(),
	getArtistByUserIdUseCase: asClass(GetArtistByUserIdUseCase).scoped(),
	createPlaylistUseCase: asClass(CreatePlaylistUseCase).scoped(),
	getPlaylistUseCase: asClass(GetPlaylistUseCase).scoped(),
	updatePlaylistUseCase: asClass(UpdatePlaylistUseCase).scoped(),
	deletePlaylistUseCase: asClass(DeletePlaylistUseCase).scoped(),
	listPlaylistsUseCase: asClass(ListPlaylistsUseCase).scoped(),
	listPlaylistsByOwnerIdUseCase: asClass(ListPlaylistsByOwnerIdUseCase).scoped(),
	addTrackToPlaylistUseCase: asClass(AddTrackToPlaylistUseCase).scoped(),
	removeTrackFromPlaylistUseCase: asClass(RemoveTrackFromPlaylistUseCase).scoped(),
	loginUseCase: asClass(LoginUseCase).scoped(),
	logoutUseCase: asClass(LogoutUseCase).scoped(),
	getAccountUseCase: asClass(GetAccountUseCase).scoped(),
	refreshTokenUseCase: asClass(RefreshTokenUseCase).scoped(),
	getUserUseCase: asClass(GetUserUseCase).scoped(),
	listUsersUseCase: asClass(ListUsersUseCase).scoped(),
	createRoleUseCase: asClass(CreateRoleUseCase).scoped(),
	updateRoleUseCase: asClass(UpdateRoleUseCase).scoped(),
	createOperationUseCase: asClass(CreateOperationUseCase).scoped(),
	updateOperationUseCase: asClass(UpdateOperationUseCase).scoped(),
	deleteOperationUseCase: asClass(DeleteOperationUseCase).scoped(),

	// controller
	userController: asClass(UserController).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),
	authController: asClass(AuthController).singleton(),
	artistController: asClass(ArtistController).singleton(),
	playlistController: asClass(PlaylistController).singleton(),
	rbacController: asClass(RBACController).singleton(),

	// middlewares
	authMiddleware: asClass(AuthMiddleware).singleton(),
})

export default container
