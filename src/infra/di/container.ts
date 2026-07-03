import { AddFavoriteAlbumUseCase } from '#application/useCases/favorite/AddFavoriteAlbum.js'
import { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import { AddFavoritePlaylistUseCase } from '#application/useCases/favorite/AddFavoritePlaylist.js'
import { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import { ListFavoriteAlbumsUseCase } from '#application/useCases/favorite/ListFavoriteAlbums.js'
import { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import { ListFavoritePlaylistsUseCase } from '#application/useCases/favorite/ListFavoritePlaylists.js'
import { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import { RemoveFavoriteAlbumUseCase } from '#application/useCases/favorite/RemoveFavoriteAlbum.js'
import { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import { RemoveFavoritePlaylistUseCase } from '#application/useCases/favorite/RemoveFavoritePlaylist.js'
import { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import FavoriteController from '#infra/controllers/FavoriteController.js'
import AlbumRepositoryPrisma from '#infra/repository/AlbumRepositoryPrisma.js'
import FavoriteRepositoryPrisma from '#infra/repository/FavoriteRepositoryPrisma.js'
import ForgotPasswordUseCase from '#application/useCases/auth/ForgotPasswordUseCase.js'
import GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import LoginUseCase from '#application/useCases/auth/LoginUseCase.js'
import LogoutUseCase from '#application/useCases/auth/LogoutUseCase.js'
import RefreshTokenUseCase from '#application/useCases/auth/RefreshTokenUseCase.js'
import ResendVerificationEmailUseCase from '#application/useCases/auth/ResendVerificationEmailUseCase.js'
import ResetPasswordUseCase from '#application/useCases/auth/ResetPasswordUseCase.js'
import SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import VerifyUserMailUseCase from '#application/useCases/mail/VerifyUserMailUseCase.js'
import { config } from '#config.js'
import AuthController from '#infra/controllers/AuthController.js'
import PasswordResetController from '#infra/controllers/PasswordResetController.js'
import RateLimitMiddleware from '#infra/http/middlewares/RateLimitMiddleware.js'
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
import ArtistRepositoryPrismaORM from '#infra/repository/ArtistRepositoryPrismaORM.js'
import ArtistController from '#infra/controllers/ArtistController.js'
import PlaylistRepositoryPrisma from '#infra/repository/PlaylistRepositoryPrisma.js'
import TrackRepositoryPrismaORM from '#infra/repository/TrackRepositoryPrismaORM.js'
import { CreatePlaylistUseCase } from '#application/useCases/playlist/CreatePlaylist.js'
import { DeletePlaylistUseCase } from '#application/useCases/playlist/DeletePlaylist.js'
import { GetPlaylistUseCase } from '#application/useCases/playlist/GetPlaylist.js'
import { ListPlaylistsUseCase } from '#application/useCases/playlist/ListPlaylists.js'
import { ListPlaylistsByOwnerIdUseCase } from '#application/useCases/playlist/ListPlaylistsByOwnerId.js'
import { UpdatePlaylistUseCase } from '#application/useCases/playlist/UpdatePlaylist.js'
import { AddTrackToPlaylistUseCase } from '#application/useCases/playlist/AddTrackToPlaylist.js'
import { RemoveTrackFromPlaylistUseCase } from '#application/useCases/playlist/RemoveTrackFromPlaylist.js'
import PlaylistController from '#infra/controllers/PlaylistController.js'
import { asClass, asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import ListUsersUseCase from '#application/useCases/user/ListUsersUseCase.js'
import UpdateUserUseCase from '#application/useCases/user/UpdateUserUseCase.js'
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
import CreateResourceUseCase from '#application/useCases/rbac/CreateResourceUseCase.js'
import UpdateResourceUseCase from '#application/useCases/rbac/UpdateResourceUseCase.js'
import DeleteResourceUseCase from '#application/useCases/rbac/DeleteResourceUseCase.js'
import CreatePermissionUseCase from '#application/useCases/rbac/CreatePermissionUseCase.js'
import DeletePermissionUseCase from '#application/useCases/rbac/DeletePermissionUseCase.js'
import DeleteRoleUseCase from '#application/useCases/rbac/DeleteRoleUseCase.js'
import GrantPermissionToRoleUseCase from '#application/useCases/rbac/GrantPermissionToRoleUseCase.js'
import RevokePermissionFromRoleUseCase from '#application/useCases/rbac/RevokePermissionFromRoleUseCase.js'
import AssignRoleToUserUseCase from '#application/useCases/rbac/AssignRoleToUserUseCase.js'
import RemoveRoleFromUserUseCase from '#application/useCases/rbac/RemoveRoleFromUserUseCase.js'
import CreateArtistUseCase from '#application/useCases/artist/CreateArtistUseCase.js'
import DeleteArtistUseCase from '#application/useCases/artist/DeleteArtistUseCase.js'
import UpdateArtistUseCase from '#application/useCases/artist/UpdateArtistUseCase.js'
import { BecomeArtistUseCase } from '#application/useCases/artist/BecomeArtistUseCase.js'

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
	artistRepository: asClass(ArtistRepositoryPrismaORM).singleton(),
	playlistRepository: asClass(PlaylistRepositoryPrisma).singleton(),
	refreshTokenRepository: asClass(RefreshTokenRepositoryPrismaORM).singleton(),
	roleRepository: asClass(RoleRepositoryPrismaORM).singleton(),
	permissionRepository: asClass(PermissionRepositoryPrismaORM).singleton(),
	resourceRepository: asClass(ResourceRepositoryPrismaORM).singleton(),
	unitOfWork: asClass(UnitOfWorkPrismaORM).singleton(),
	userRoleRepository: asClass(UserRoleRepositoryPrismaORM).singleton(),
	operationRepository: asClass(OperationRepositoryPrismaORM).singleton(),
	trackRepository: asClass(TrackRepositoryPrismaORM).singleton(),
	albumRepository: asClass(AlbumRepositoryPrisma).singleton(),
	favoriteRepository: asClass(FavoriteRepositoryPrisma).singleton(),

	// use cases
	signUpUserCase: asClass(SignupUseCase).scoped(),
	verifyUserMailUserCase: asClass(VerifyUserMailUseCase).scoped(),
	resendVerificationEmailUserCase: asClass(ResendVerificationEmailUseCase).scoped(),
	createArtistUseCase: asClass(CreateArtistUseCase).scoped(),
	updateArtistUseCase: asClass(UpdateArtistUseCase).scoped(),
	deleteArtistUseCase: asClass(DeleteArtistUseCase).scoped(),
	becomeArtistUseCase: asClass(BecomeArtistUseCase).scoped(),
	createPlaylistUseCase: asClass(CreatePlaylistUseCase).scoped(),
	getPlaylistUseCase: asClass(GetPlaylistUseCase).scoped(),
	updatePlaylistUseCase: asClass(UpdatePlaylistUseCase).scoped(),
	deletePlaylistUseCase: asClass(DeletePlaylistUseCase).scoped(),
	listPlaylistsUseCase: asClass(ListPlaylistsUseCase).scoped(),
	listPlaylistsByOwnerIdUseCase: asClass(ListPlaylistsByOwnerIdUseCase).scoped(),
	addTrackToPlaylistUseCase: asClass(AddTrackToPlaylistUseCase).scoped(),
	removeTrackFromPlaylistUseCase: asClass(RemoveTrackFromPlaylistUseCase).scoped(),
	forgotPasswordUseCase: asClass(ForgotPasswordUseCase).scoped(),
	loginUseCase: asClass(LoginUseCase).scoped(),
	logoutUseCase: asClass(LogoutUseCase).scoped(),
	getAccountUseCase: asClass(GetAccountUseCase).scoped(),
	refreshTokenUseCase: asClass(RefreshTokenUseCase).scoped(),
	resetPasswordUseCase: asClass(ResetPasswordUseCase).scoped(),
	getUserUseCase: asClass(GetUserUseCase).scoped(),
	listUsersUseCase: asClass(ListUsersUseCase).scoped(),
	updateUserUseCase: asClass(UpdateUserUseCase).scoped(),
	createRoleUseCase: asClass(CreateRoleUseCase).scoped(),
	updateRoleUseCase: asClass(UpdateRoleUseCase).scoped(),
	createOperationUseCase: asClass(CreateOperationUseCase).scoped(),
	updateOperationUseCase: asClass(UpdateOperationUseCase).scoped(),
	deleteOperationUseCase: asClass(DeleteOperationUseCase).scoped(),
	createResourceUseCase: asClass(CreateResourceUseCase).scoped(),
	updateResourceUseCase: asClass(UpdateResourceUseCase).scoped(),
	deleteResourceUseCase: asClass(DeleteResourceUseCase).scoped(),
	createPermissionUseCase: asClass(CreatePermissionUseCase).scoped(),
	deletePermissionUseCase: asClass(DeletePermissionUseCase).scoped(),
	deleteRoleUseCase: asClass(DeleteRoleUseCase).scoped(),
	grantPermissionToRoleUseCase: asClass(GrantPermissionToRoleUseCase).scoped(),
	revokePermissionFromRoleUseCase: asClass(RevokePermissionFromRoleUseCase).scoped(),
	assignRoleToUserUseCase: asClass(AssignRoleToUserUseCase).scoped(),
	removeRoleFromUserUseCase: asClass(RemoveRoleFromUserUseCase).scoped(),
	addFavoriteTrackUseCase: asClass(AddFavoriteTrackUseCase).scoped(),
	removeFavoriteTrackUseCase: asClass(RemoveFavoriteTrackUseCase).scoped(),
	listFavoriteTracksUseCase: asClass(ListFavoriteTracksUseCase).scoped(),
	addFavoriteArtistUseCase: asClass(AddFavoriteArtistUseCase).scoped(),
	removeFavoriteArtistUseCase: asClass(RemoveFavoriteArtistUseCase).scoped(),
	listFavoriteArtistsUseCase: asClass(ListFavoriteArtistsUseCase).scoped(),
	addFavoritePlaylistUseCase: asClass(AddFavoritePlaylistUseCase).scoped(),
	removeFavoritePlaylistUseCase: asClass(RemoveFavoritePlaylistUseCase).scoped(),
	listFavoritePlaylistsUseCase: asClass(ListFavoritePlaylistsUseCase).scoped(),
	addFavoriteAlbumUseCase: asClass(AddFavoriteAlbumUseCase).scoped(),
	removeFavoriteAlbumUseCase: asClass(RemoveFavoriteAlbumUseCase).scoped(),
	listFavoriteAlbumsUseCase: asClass(ListFavoriteAlbumsUseCase).scoped(),

	// controller
	userController: asClass(UserController).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),
	authController: asClass(AuthController).singleton(),
	passwordResetController: asClass(PasswordResetController).singleton(),
	artistController: asClass(ArtistController).singleton(),
	favoriteController: asClass(FavoriteController).singleton(),
	playlistController: asClass(PlaylistController).singleton(),
	rbacController: asClass(RBACController).singleton(),

	// middlewares
	authMiddleware: asClass(AuthMiddleware).singleton(),
	forgotPasswordRateLimiter: asFunction(
		({ loggerService }: { loggerService: any }) =>
			new RateLimitMiddleware(
				loggerService,
				config.rateLimit.forgotPassword.windowMs,
				config.rateLimit.forgotPassword.max,
			),
	).singleton(),
	resetPasswordRateLimiter: asFunction(
		({ loggerService }: { loggerService: any }) =>
			new RateLimitMiddleware(
				loggerService,
				config.rateLimit.resetPassword.windowMs,
				config.rateLimit.resetPassword.max,
			),
	).singleton(),
	loginRateLimiter: asFunction(
		({ loggerService }: { loggerService: any }) =>
			new RateLimitMiddleware(
				loggerService,
				config.rateLimit.login.windowMs,
				config.rateLimit.login.max,
			),
	).singleton(),
	signupRateLimiter: asFunction(
		({ loggerService }: { loggerService: any }) =>
			new RateLimitMiddleware(
				loggerService,
				config.rateLimit.signup.windowMs,
				config.rateLimit.signup.max,
			),
	).singleton(),
	resendVerificationRateLimiter: asFunction(
		({ loggerService }: { loggerService: any }) =>
			new RateLimitMiddleware(
				loggerService,
				config.rateLimit.resendVerification.windowMs,
				config.rateLimit.resendVerification.max,
			),
	).singleton(),
})

export default container
