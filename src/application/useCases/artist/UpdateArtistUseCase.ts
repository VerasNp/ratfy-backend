import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'

class UpdateArtistUseCase {
	public constructor(
		private readonly artistRepository: ArtistRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(artistId: string, input: Input): Promise<Output> {
		const foundArtist = await this.artistRepository.findById(artistId)
		if (!foundArtist) {
			this.loggerService.warn(`Artist with ID ${artistId} not found when trying to update.`, {
				origin: 'UpdateArtistUseCase',
			})
			throw new ResourceNotFoundError('Artist not found')
		}
		foundArtist.updateData(input)
		await this.artistRepository.update(artistId, foundArtist)
		return {
			id: foundArtist.id,
			bio: foundArtist.bio,
			userId: foundArtist.userId,
			user: {
				name: foundArtist.user?.name!,
			},
		}
	}
}

export default UpdateArtistUseCase

type Input = {
	bio: string | null
}

type Output = {
	id: string
	bio: string | null
	userId: string
	user: {
		name: string
	}
}
