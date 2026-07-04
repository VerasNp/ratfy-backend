import { asClass, asValue, createContainer, InjectionMode } from 'awilix'

import { CreateArtistUseCase } from '#application/useCases/artist/CreateArtist.js'
import { DeleteArtistUseCase } from '#application/useCases/artist/DeleteArtist.js'
import { GetArtistUseCase } from '#application/useCases/artist/GetArtist.js'
import { GetArtistByUserIdUseCase } from '#application/useCases/artist/GetArtistByUserId.js'
import { ListArtistsUseCase } from '#application/useCases/artist/ListArtists.js'
import { UpdateArtistUseCase } from '#application/useCases/artist/UpdateArtist.js'
import LoginUseCase from '#application/useCases/auth/LoginUseCase.js'
import LogoutUseCase from '#application/useCases/auth/LogoutUseCase.js'
import RefreshTokenUseCase from '#application/useCases/auth/RefreshTokenUseCase.js'
import ResendVerificationEmailUseCase from '#application/useCases/auth/ResendVerificationEmailUseCase.js'
import VerifyUserMailUseCase from '#application/useCases/mail/VerifyUserMailUseCase.js'
import { DeleteAlbumUseCase } from '#application/useCases/album/DeleteAlbum.js'
import { AddTrackToPlaylistUseCase } from '#application/useCases/playlist/AddTrackToPlaylist.js'
import { CreatePlaylistUseCase } from '#application/useCases/playlist/CreatePlaylist.js'
import { DeleteTrackUseCase } from '#application/useCases/track/DeleteTrack.js'
import { DeletePlaylistUseCase } from '#application/useCases/playlist/DeletePlaylist.js'
import { GetPlaylistUseCase } from '#application/useCases/playlist/GetPlaylist.js'
import { ListPlaylistsUseCase } from '#application/useCases/playlist/ListPlaylists.js'
import { ListPlaylistsByOwnerIdUseCase } from '#application/useCases/playlist/ListPlaylistsByOwnerId.js'
import { RemoveTrackFromPlaylistUseCase } from '#application/useCases/playlist/RemoveTrackFromPlaylist.js'
import { UpdatePlaylistUseCase } from '#application/useCases/playlist/UpdatePlaylist.js'
import AssignRoleToUserUseCase from '#application/useCases/rbac/AssignRoleToUserUseCase.js'
import CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import CreatePermissionUseCase from '#application/useCases/rbac/CreatePermissionUseCase.js'
import CreateResourceUseCase from '#application/useCases/rbac/CreateResourceUseCase.js'
import CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'
import DeletePermissionUseCase from '#application/useCases/rbac/DeletePermissionUseCase.js'
import DeleteResourceUseCase from '#application/useCases/rbac/DeleteResourceUseCase.js'
import DeleteRoleUseCase from '#application/useCases/rbac/DeleteRoleUseCase.js'
import GrantPermissionToRoleUseCase from '#application/useCases/rbac/GrantPermissionToRoleUseCase.js'
import RemoveRoleFromUserUseCase from '#application/useCases/rbac/RemoveRoleFromUserUseCase.js'
import RevokePermissionFromRoleUseCase from '#application/useCases/rbac/RevokePermissionFromRoleUseCase.js'
import UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import UpdateResourceUseCase from '#application/useCases/rbac/UpdateResourceUseCase.js'
import UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import { UploadAlbumCoverUseCase } from '#application/useCases/upload/UploadAlbumCoverUseCase.js'
import { UploadArtistProfileImageUseCase } from '#application/useCases/upload/UploadArtistProfileImageUseCase.js'
import { UploadPlaylistCoverUseCase } from '#application/useCases/upload/UploadPlaylistCoverUseCase.js'
import { UploadTrackAudioUseCase } from '#application/useCases/upload/UploadTrackAudioUseCase.js'
import GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import ListUsersUseCase from '#application/useCases/user/ListUsersUseCase.js'
import SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import { config } from '#config.js'
import RedisCacheAdapter from '#infra/cache/RedisCacheAdapter.js'
import ArtistController from '#infra/controllers/ArtistController.js'
import AuthController from '#infra/controllers/AuthController.js'
import PlaybackController from '#infra/controllers/PlaybackController.js'
import PlaylistController from '#infra/controllers/PlaylistController.js'
import RBACController from '#infra/controllers/RBACController.js'
import UploadController from '#infra/controllers/UploadController.js'
import UserController from '#infra/controllers/UserController.js'
import VerifyEmailController from '#infra/controllers/VerifyEmailController.js'
import { prisma } from '#infra/database/prisma.js'
import SwaggerDocs from '#infra/docs/SwaggerDocs.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import PinoAdapter from '#infra/logger/PinoAdapter.js'
import NodemailerAdapter from '#infra/mail/NodemailerAdapter.js'
import AlbumRepositoryPrisma from '#infra/repository/AlbumRepositoryPrisma.js'
import ArtistRepositoryPrisma from '#infra/repository/ArtistRepositoryPrisma.js'
import PlaylistRepositoryPrisma from '#infra/repository/PlaylistRepositoryPrisma.js'
import PermissionRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'
import OperationRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'
import ResourceRepositoryPrismaORM from '#infra/repository/rbac/ResourceRepositoryPrismaORM.js'
import RoleRepositoryPrismaORM from '#infra/repository/rbac/RoleRepositoryPrismaORM.js'
import UserRoleRepositoryPrismaORM from '#infra/repository/rbac/UserRoleRepositoryPrismaORM.js'
import RefreshTokenRepositoryPrismaORM from '#infra/repository/RefreshTokenRepositoryPrismaORM.js'
import TrackRepositoryPrismaORM from '#infra/repository/TrackRepositoryPrismaORM.js'
import UnitOfWorkPrismaORM from '#infra/repository/UnitOfWorkPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import Argon2Adapter from '#infra/security/Argon2Adapter.js'
import JwtAdapter from '#infra/security/JwtAdapter.js'
import MinioStorageAdapter from '#infra/storage/MinioStorageAdapter.js'
import HandlebarsRendererAdapter from '#infra/templateRenderer/HandlebarsRendererAdapter.js'

const container = createContainer({ injectionMode: InjectionMode.CLASSIC })

container.register({
	addTrackToPlaylistUseCase: asClass(AddTrackToPlaylistUseCase).scoped(),
	albumRepository: asClass(AlbumRepositoryPrisma).singleton(),
	// config
	appUrl: asValue(config.app.url),
	minioConfig: asValue({
		accessKey: config.minio.accessKey,
		endpoint: config.minio.endpoint,
		port: config.minio.port,
		secretKey: config.minio.secretKey,
		useSSL: config.minio.useSSL,
		publicUrl: config.minio.publicUrl,
		region: config.minio.region,
	}),
	artistController: asClass(ArtistController).singleton(),
	artistRepository: asClass(ArtistRepositoryPrisma).singleton(),
	assignRoleToUserUseCase: asClass(AssignRoleToUserUseCase).scoped(),
	authController: asClass(AuthController).singleton(),

	// middlewares
	authMiddleware: asClass(AuthMiddleware).singleton(),
	bucketAudio: asValue(config.minio.bucketAudio),
	bucketDrm: asValue(config.minio.bucketDrm),
	bucketImages: asValue(config.minio.bucketImages),
	cacheService: asClass(RedisCacheAdapter).singleton(),
	connectTimeout: asValue(config.redis.connectTimeout),
	createArtistUseCase: asClass(CreateArtistUseCase).scoped(),
	createOperationUseCase: asClass(CreateOperationUseCase).scoped(),
	createPermissionUseCase: asClass(CreatePermissionUseCase).scoped(),
	createPlaylistUseCase: asClass(CreatePlaylistUseCase).scoped(),

	createResourceUseCase: asClass(CreateResourceUseCase).scoped(),
	createRoleUseCase: asClass(CreateRoleUseCase).scoped(),
	databaseUrl: asValue(config.database.url),
	deleteAlbumUseCase: asClass(DeleteAlbumUseCase).scoped(),
	deleteArtistUseCase: asClass(DeleteArtistUseCase).scoped(),
	deleteOperationUseCase: asClass(DeleteOperationUseCase).scoped(),
	deletePermissionUseCase: asClass(DeletePermissionUseCase).scoped(),
	deletePlaylistUseCase: asClass(DeletePlaylistUseCase).scoped(),
	deleteTrackUseCase: asClass(DeleteTrackUseCase).scoped(),
	deleteResourceUseCase: asClass(DeleteResourceUseCase).scoped(),
	deleteRoleUseCase: asClass(DeleteRoleUseCase).scoped(),
	docsService: asClass(SwaggerDocs).singleton(),
	getAccountUseCase: asClass(GetAccountUseCase).scoped(),
	getArtistByUserIdUseCase: asClass(GetArtistByUserIdUseCase).scoped(),

	getArtistUseCase: asClass(GetArtistUseCase).scoped(),
	getPlaylistUseCase: asClass(GetPlaylistUseCase).scoped(),
	getUserUseCase: asClass(GetUserUseCase).scoped(),
	grantPermissionToRoleUseCase: asClass(GrantPermissionToRoleUseCase).scoped(),
	hashService: asClass(Argon2Adapter).singleton(),

	httpServer: asClass(ExpressAdapter).singleton(),
	jwtSecret: asValue(config.jwt.secret),
	listArtistsUseCase: asClass(ListArtistsUseCase).scoped(),
	listPlaylistsByOwnerIdUseCase: asClass(ListPlaylistsByOwnerIdUseCase).scoped(),
	listPlaylistsUseCase: asClass(ListPlaylistsUseCase).scoped(),
	listUsersUseCase: asClass(ListUsersUseCase).scoped(),
	loggerService: asClass(PinoAdapter).singleton(),
	loginUseCase: asClass(LoginUseCase).scoped(),
	logoutUseCase: asClass(LogoutUseCase).scoped(),
	mailService: asClass(NodemailerAdapter).singleton(),
	nodeEnv: asValue(config.app.nodeEnv),
	operationRepository: asClass(OperationRepositoryPrismaORM).singleton(),
	// infra
	orm: asValue(prisma),
	permissionRepository: asClass(PermissionRepositoryPrismaORM).singleton(),
	playbackController: asClass(PlaybackController).singleton(),
	playlistController: asClass(PlaylistController).singleton(),
	playlistRepository: asClass(PlaylistRepositoryPrisma).singleton(),
	port: asValue(config.app.port),
	rbacController: asClass(RBACController).singleton(),
	redisUrl: asValue(config.redis.url),
	refreshTokenRepository: asClass(RefreshTokenRepositoryPrismaORM).singleton(),
	refreshTokenUseCase: asClass(RefreshTokenUseCase).scoped(),
	removeRoleFromUserUseCase: asClass(RemoveRoleFromUserUseCase).scoped(),
	removeTrackFromPlaylistUseCase: asClass(RemoveTrackFromPlaylistUseCase).scoped(),
	resendVerificationEmailUserCase: asClass(ResendVerificationEmailUseCase).scoped(),
	resourceRepository: asClass(ResourceRepositoryPrismaORM).singleton(),
	revokePermissionFromRoleUseCase: asClass(RevokePermissionFromRoleUseCase).scoped(),
	roleRepository: asClass(RoleRepositoryPrismaORM).singleton(),
	// use cases
	signUpUserCase: asClass(SignupUseCase).scoped(),
	smtpConfig: asValue(config.mail),
	// storage & cache
	storageService: asClass(MinioStorageAdapter).singleton(),
	templateRendererService: asClass(HandlebarsRendererAdapter).singleton(),
	templatesDir: asValue(config.templates.dir),
	tokenService: asClass(JwtAdapter).singleton(),
	trackRepository: asClass(TrackRepositoryPrismaORM).singleton(),
	unitOfWork: asClass(UnitOfWorkPrismaORM).singleton(),
	updateArtistUseCase: asClass(UpdateArtistUseCase).scoped(),
	updateOperationUseCase: asClass(UpdateOperationUseCase).scoped(),

	updatePlaylistUseCase: asClass(UpdatePlaylistUseCase).scoped(),
	updateResourceUseCase: asClass(UpdateResourceUseCase).scoped(),
	updateRoleUseCase: asClass(UpdateRoleUseCase).scoped(),
	uploadAlbumCoverUseCase: asClass(UploadAlbumCoverUseCase).scoped(),

	uploadArtistProfileImageUseCase: asClass(UploadArtistProfileImageUseCase).scoped(),
	maxFileSize: asValue(config.upload.maxFileSize),
	uploadController: asClass(UploadController).singleton(),
	uploadPlaylistCoverUseCase: asClass(UploadPlaylistCoverUseCase).scoped(),
	// upload use cases
	uploadTrackAudioUseCase: asClass(UploadTrackAudioUseCase).scoped(),
	// controller
	userController: asClass(UserController).singleton(),
	// repositories
	userRepository: asClass(UserRepositoryPrismaORM).singleton(),
	userRoleRepository: asClass(UserRoleRepositoryPrismaORM).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),

	verifyUserMailUserCase: asClass(VerifyUserMailUseCase).scoped(),
})

export default container
