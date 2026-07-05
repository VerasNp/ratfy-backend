import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import DeleteArtistUseCase from '#application/useCases/artist/DeleteArtistUseCase.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deleteArtistUseCase: DeleteArtistUseCase
let artistRepository: ArtistRepository

describe('DeleteArtistUseCase', () => {
	let dummyUser: User
	let dummyArtist: Artist
	beforeEach(() => {
		dummyUser = createDummyUser()
		dummyArtist = createDummyArtist(dummyUser)
		artistRepository = new ArtistRepositoryMemory([dummyArtist])
		deleteArtistUseCase = new DeleteArtistUseCase(artistRepository)
	})
	it('should delete an artist by ID', async () => {
		const deletedArtist = await deleteArtistUseCase.execute({ id: dummyArtist.id })
		const foundArtists = await artistRepository.list(1, 10)
		expect(foundArtists).toHaveLength(0)
		expect(deletedArtist).toEqual({
			id: dummyArtist.id,
			bio: dummyArtist.bio,
			userId: dummyArtist.userId,
			user: {
				name: dummyArtist.user?.name!,
			},
		})
	})

	it('should throw an error if the artist does not exist', async () => {
		await expect(deleteArtistUseCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
			'Artist not found',
		)
	})
})
