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
	artistRepository: asClass(ArtistRepositoryPrisma).singleton(),
	playlistRepository: asClass(PlaylistRepositoryPrisma).singleton(),

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
	createPlaylistUseCase: asClass(CreatePlaylistUseCase).scoped(),
	getPlaylistUseCase: asClass(GetPlaylistUseCase).scoped(),
	updatePlaylistUseCase: asClass(UpdatePlaylistUseCase).scoped(),
	deletePlaylistUseCase: asClass(DeletePlaylistUseCase).scoped(),
	listPlaylistsUseCase: asClass(ListPlaylistsUseCase).scoped(),
	listPlaylistsByOwnerIdUseCase: asClass(ListPlaylistsByOwnerIdUseCase).scoped(),
	addTrackToPlaylistUseCase: asClass(AddTrackToPlaylistUseCase).scoped(),
	removeTrackFromPlaylistUseCase: asClass(RemoveTrackFromPlaylistUseCase).scoped(),

	// controller
	userController: asClass(UserController).singleton(),
	verifyEmailController: asClass(VerifyEmailController).singleton(),
	artistController: asClass(ArtistController).singleton(),
	playlistController: asClass(PlaylistController).singleton(),
})

export default container
