import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

class DeleteArtistUseCase {
	constructor(private readonly artistRepository: ArtistRepository) {}

	public async execute(input: Input): Promise<Output> {
		const foundArtist = await this.artistRepository.findById(input.id)
		if (!foundArtist) {
			throw new ResourceNotFoundError('Artist not found')
		}
		const deletedArtist = await this.artistRepository.delete(foundArtist.id)
		return {
			id: deletedArtist!.id,
			bio: deletedArtist!.bio,
			userId: deletedArtist!.userId,
			user: {
				name: deletedArtist!.user?.name!,
			},
		}
	}
}

export default DeleteArtistUseCase

type Input = {
	id: string
}

type Output = {
	id: string
	bio: string | null
	userId: string
	user: {
		name: string
	}
}
