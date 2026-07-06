import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadPlaylistCoverUseCase } from '#application/useCases/upload/UploadPlaylistCoverUseCase.js'
import Playlist from '#domain/playlist/Playlist.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let useCase: UploadPlaylistCoverUseCase
let playlistRepo: PlaylistRepositoryMemory
let dummyPlaylist: Playlist

beforeEach(() => {
  playlistRepo = new PlaylistRepositoryMemory()
  vi.clearAllMocks()
  dummyPlaylist = Playlist.create({
    name: 'Test Playlist',
    ownerId: '550e8400-e29b-41d4-a716-446655440000',
  })
  playlistRepo.create(dummyPlaylist)
  useCase = new UploadPlaylistCoverUseCase(playlistRepo, storagePortMock, loggerPortMock, 'images')
})

describe('UploadPlaylistCoverUseCase', () => {
  it('should upload cover image and update playlist', async () => {
    vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/images/cover.jpg')

    const fileData = Buffer.from('fake-image-data')
    const result = await useCase.execute(dummyPlaylist.id, fileData, 'image/jpeg')

    expect(result.coverImageKey).toMatch(/^playlists\/.+\.jpg$/)
    expect(result.coverImageSize).toBe(fileData.length)
    expect(storagePortMock.upload).toHaveBeenCalledOnce()

    const updated = await playlistRepo.findById(dummyPlaylist.id)
    expect(updated!.coverImageKey).toBe(result.coverImageKey)
    expect(updated!.coverImageSize).toBe(fileData.length)
  })

  it('should throw PlaylistNotFoundError for non-existent playlist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute(fakeId, Buffer.from('data'), 'image/jpeg')).rejects.toThrow(
      `Playlist with id "${fakeId}" not found`,
    )
    expect(storagePortMock.upload).not.toHaveBeenCalled()
  })
})
