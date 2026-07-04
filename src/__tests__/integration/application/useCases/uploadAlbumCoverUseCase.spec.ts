import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadAlbumCoverUseCase } from '#application/useCases/upload/UploadAlbumCoverUseCase.js'
import Album from '#domain/album/Album.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let useCase: UploadAlbumCoverUseCase
let albumRepo: AlbumRepositoryMemory
let dummyAlbum: Album

beforeEach(() => {
  albumRepo = new AlbumRepositoryMemory()
  vi.clearAllMocks()
  dummyAlbum = Album.create({
    albumType: 'album',
    artistIds: [],
    label: 'Test Label',
    name: 'Test Album',
    releaseDate: new Date('2024-01-01'),
    releasePrecision: 'day',
    totalTracks: 10,
  })
  albumRepo.create(dummyAlbum)
  useCase = new UploadAlbumCoverUseCase(albumRepo, storagePortMock, loggerPortMock, 'images')
})

describe('UploadAlbumCoverUseCase', () => {
  it('should upload cover image and update album', async () => {
    vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/images/cover.jpg')

    const fileData = Buffer.from('fake-image-data')
    const result = await useCase.execute(dummyAlbum.id, fileData, 'image/jpeg')

    expect(result.coverImageKey).toMatch(/^albums\/.+\.jpg$/)
    expect(result.coverImageSize).toBe(fileData.length)
    expect(storagePortMock.upload).toHaveBeenCalledOnce()

    const updated = await albumRepo.findById(dummyAlbum.id)
    expect(updated!.coverImageKey).toBe(result.coverImageKey)
    expect(updated!.coverImageSize).toBe(fileData.length)
  })

  it('should throw AlbumNotFoundError for non-existent album', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute(fakeId, Buffer.from('data'), 'image/jpeg')).rejects.toThrow(
      `Album with id "${fakeId}" not found`,
    )
    expect(storagePortMock.upload).not.toHaveBeenCalled()
  })
})
