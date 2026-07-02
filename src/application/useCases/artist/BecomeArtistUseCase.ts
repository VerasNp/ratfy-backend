import type { BecomeArtistInputDTO } from '#application/DTOs/artist/BecomeArtistInputDTO.js'
import type { ArtistCreateOutputDTO } from '#application/DTOs/artist/ArtistCreateOutputDTO.js'
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

class BecomeArtistUseCase {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly artistRepository: ArtistRepository,
		private readonly roleRepository: RoleRepository,
		private readonly userRoleRepository: UserRoleRepository,
		private readonly unitOfWork: UnitOfWork,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(userId: string, input: BecomeArtistInputDTO): Promise<ArtistCreateOutputDTO> {
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

		const artistRole = await this.roleRepository.findRoleByName(Role.PredefinedRoles.ARTIST)
		if (!artistRole) {
			this.loggerService.error('The ARTIST role does not exist in the system', {
				origin: 'BecomeArtistUseCase',
			})
			throw new MissingApplicationSetupError('Internal server error')
		}

		const artist = Artist.create({ userId, bio: input.bio ?? null })

		await this.unitOfWork.execute(async () => {
			await this.artistRepository.create(artist)
			await this.userRoleRepository.assignRoleToUser(userId, artistRole.id)
		})

		this.loggerService.info(`User ${userId} became an artist`, {
			origin: 'BecomeArtistUseCase',
		})

		return {
			id: artist.id,
			userId: artist.userId,
			bio: artist.bio,
			createdAt: artist.createdAt,
			updatedAt: artist.updatedAt,
		}
	}
}

export default BecomeArtistUseCase
