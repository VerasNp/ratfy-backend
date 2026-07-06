import type { TrackRepository } from '#application/ports/TrackRepository.js'

class SearchTracksUseCase {
	public constructor(private readonly trackRepository: TrackRepository) {}

	public async execute(input: Input): Promise<Output[]> {
		
		return []
	}
}

export default SearchTracksUseCase

type Input = {
	page: number
	limit: number
}

type Output = {
	id: string
	title: string
	durationMs: number
	discNumber: number
	trackNumber: number
	explicit: boolean
	lyrics: string | null
	isPublic: boolean
	album: {
		id: string
		name: string
	}
	artists: {
		id: string
		name: string
	}[]
}
