import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadTrackAudioUseCase } from '#application/useCases/upload/UploadTrackAudioUseCase.js'
import Track from '#domain/track/Track.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let useCase: UploadTrackAudioUseCase
let trackRepo: TrackRepositoryMemory
let dummyTrack: Track

beforeEach(() => {
  trackRepo = new TrackRepositoryMemory()
  vi.clearAllMocks()
  dummyTrack = Track.create({
    albumId: '550e8400-e29b-41d4-a716-446655440000',
    artistIds: [],
    durationMs: 200000,
    explicit: false,
    name: 'Test Track',
    trackNumber: 1,
  })
  trackRepo.create(dummyTrack)
  useCase = new UploadTrackAudioUseCase(trackRepo, storagePortMock, loggerPortMock, 'audio')
})

describe('UploadTrackAudioUseCase', () => {
  it('should upload audio and update track', async () => {
    vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/audio/file.mp3')

    const fileData = Buffer.from('fake-audio-data')
    const result = await useCase.execute(dummyTrack.id, fileData, 'audio/mpeg')

    expect(result.audioFileKey).toMatch(/^tracks\/.+\.mp3$/)
    expect(result.audioFileSize).toBe(fileData.length)
    expect(result.audioContentType).toBe('audio/mpeg')
    expect(storagePortMock.upload).toHaveBeenCalledOnce()

    const updated = await trackRepo.findById(dummyTrack.id)
    expect(updated!.audioFileKey).toBe(result.audioFileKey)
    expect(updated!.audioFileSize).toBe(fileData.length)
    expect(updated!.audioContentType).toBe('audio/mpeg')
  })

  it('should throw TrackNotFoundError for non-existent track', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute(fakeId, Buffer.from('data'), 'audio/mpeg')).rejects.toThrow(
      `Track with id "${fakeId}" not found`,
    )
    expect(storagePortMock.upload).not.toHaveBeenCalled()
  })
})
