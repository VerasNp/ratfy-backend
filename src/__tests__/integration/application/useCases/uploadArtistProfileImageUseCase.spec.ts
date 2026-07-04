import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadArtistProfileImageUseCase } from '#application/useCases/upload/UploadArtistProfileImageUseCase.js'
import Artist from '#domain/artist/Artist.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let useCase: UploadArtistProfileImageUseCase
let artistRepo: ArtistRepositoryMemory
let dummyArtist: Artist

beforeEach(() => {
  artistRepo = new ArtistRepositoryMemory()
  vi.clearAllMocks()
  dummyArtist = Artist.create({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    bio: 'Test artist bio',
  })
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
