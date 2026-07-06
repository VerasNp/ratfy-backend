import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import Artist from '#domain/artist/Artist.js'
import Role from '#domain/rbac/role/Role.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'

export class BecomeArtistUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly artistRepository: ArtistRepository,
		private readonly roleRepository: RoleRepository,
		private readonly userRoleRepository: UserRoleRepository,
		private readonly unitOfWork: UnitOfWork,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string, input: Input): Promise<Output> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			this.loggerService.warn(`User with id ${userId} not found`, {
				origin: 'BecomeArtistUseCase',
			})
			throw new ResourceNotFoundError('User not found')
		}

		const existingArtist = await this.artistRepository.findByUserId(userId)
		if (existingArtist) {
			this.loggerService.warn(`User ${userId} already has an artist profile`, {
				origin: 'BecomeArtistUseCase',
			})
			throw new ResourceAlreadyExistsError('User already has an artist profile')
		}

		if (!user.isEmailVerified()) {
			this.loggerService.warn(`User ${userId} attempted to become an artist without verified email`, {
				origin: 'BecomeArtistUseCase',
			})
			throw new UnauthorizedError('Email must be verified to become an artist')
		}

		const artistRole = await this.roleRepository.findRoleByName(Role.PredefinedRoles.ARTIST)
		if (!artistRole) {
			this.loggerService.error('The ARTIST role does not exist in the system', {
				origin: 'BecomeArtistUseCase',
			})
			throw new MissingApplicationSetupError('Internal server error')
		}

		const artist = Artist.create({ user, bio: input.bio ?? null })

		await this.unitOfWork.execute(async (tx) => {
			await this.artistRepository.create(artist, tx)
			await this.userRoleRepository.assignRoleToUser(userId, artistRole.id, tx)
		})

		user.assignRole(artistRole)

		this.loggerService.info(`User ${userId} became an artist`, {
			origin: 'BecomeArtistUseCase',
		})

		return {
			id: artist.id,
			userId: artist.userId,
			bio: artist.bio,
		}
	}
}

type Input = {
	bio?: string | null
}

type Output = {
	id: string
	userId: string
	bio: string | null
}


