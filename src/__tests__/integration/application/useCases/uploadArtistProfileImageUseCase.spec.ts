import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadArtistProfileImageUseCase } from '#application/useCases/upload/UploadArtistProfileImageUseCase.js'
import Artist from '#domain/artist/Artist.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type User from '#domain/user/User.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'

let useCase: UploadArtistProfileImageUseCase
let artistRepo: ArtistRepositoryMemory
let dummyArtist: Artist
let dummyUser: User

beforeEach(() => {
  artistRepo = new ArtistRepositoryMemory()
  vi.clearAllMocks()
  dummyUser = createDummyUser({ name: 'Test User', email: 'foo@bar.com'})
  dummyArtist = createDummyArtist(dummyUser, { bio: 'Test bio' })
  artistRepo.create(dummyArtist)
  useCase = new UploadArtistProfileImageUseCase(artistRepo, storagePortMock, loggerPortMock, 'images')
})

describe('UploadArtistProfileImageUseCase', () => {
  it('should upload profile image and update artist', async () => {
    vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/images/profile.jpg')

    const fileData = Buffer.from('fake-image-data')
    const result = await useCase.execute(dummyArtist.id, fileData, 'image/jpeg')

    expect(result.profileImageKey).toMatch(/^artists\/.+\.jpg$/)
    expect(result.profileImageSize).toBe(fileData.length)
    expect(storagePortMock.upload).toHaveBeenCalledOnce()

    const updated = await artistRepo.findById(dummyArtist.id)
    expect(updated!.profileImageKey).toBe(result.profileImageKey)
    expect(updated!.profileImageSize).toBe(fileData.length)
  })

  it('should throw ArtistNotFoundError for non-existent artist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute(fakeId, Buffer.from('data'), 'image/jpeg')).rejects.toThrow(
      `Artist with id "${fakeId}" not found`,
    )
    expect(storagePortMock.upload).not.toHaveBeenCalled()
  })
})
