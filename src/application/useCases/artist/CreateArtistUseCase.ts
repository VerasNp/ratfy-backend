import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

import Artist from '#domain/artist/Artist.js'

class CreateArtistUseCase {
	constructor(
		private readonly artistRepository: ArtistRepository,
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
	) {}

	async execute(input: Input): Promise<Output> {
		const foundUser = await this.userRepository.findById(input.userId)
		if (!foundUser) {
			this.loggerService.warn(
				`User with ID ${input.userId} not found when trying to create an artist.`,
				{ origin: 'CreateArtistUseCase' },
			)
			throw new ResourceNotFoundError('User not found')
		}
		const foundArtist = await this.artistRepository.findByUserId(input.userId)
		if (foundArtist) {
			this.loggerService.warn(`Artist already exists for user with ID ${input.userId}.`, {
				origin: 'CreateArtistUseCase',
			})
			throw new ResourceAlreadyExistsError('This user is already an artist')
		}
		const artist = Artist.create({
			bio: input.bio ?? null,
			user: foundUser,
		})
		const savedArtist = await this.artistRepository.create(artist)
		return {
			id: savedArtist.id,
			userId: savedArtist.userId,
			bio: savedArtist.bio,
			user: {
				name: savedArtist.user?.name!,
			},
		}
	}
}

export default CreateArtistUseCase

type Input = {
	userId: string
	bio: string | null
}

type Output = {
	id: string
	userId: string
	bio: string | null
	user: {
		name: string
	}
}
