import crypto from 'crypto'

import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { StoragePort } from '#application/ports/StoragePort.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'

import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'
import { mimeToExtension } from './mimeToExtension.js'

export class UploadTrackAudioUseCase {
  public constructor(
    private readonly trackRepository: TrackRepository,
    private readonly storageService: StoragePort,
    private readonly loggerService: LoggerPort,
    private readonly bucketAudio: string,
  ) {}

  public async execute(trackId: string, file: Buffer, contentType: string): Promise<{ audioContentType: string; audioFileKey: string; audioFileSize: number; }> {
    const track = await this.trackRepository.findById(trackId)
    if (!track) throw new TrackNotFoundError(trackId)

    const oldKey = track.audioFileKey
    const extension = mimeToExtension(contentType, 'bin')
    const key = `tracks/${trackId}/${crypto.randomUUID()}.${extension}`

    await this.storageService.upload(this.bucketAudio, key, file, contentType)

    if (oldKey) {
      this.storageService.delete(this.bucketAudio, oldKey).catch(() => {
        this.loggerService.warn('Failed to delete old track audio', { oldKey, trackId })
      })
    }

    try {
      await this.trackRepository.update(trackId, {
        audioContentType: contentType,
        audioFileKey: key,
        audioFileSize: file.length,
      }, oldKey)
    } catch (error) {
      this.storageService.delete(this.bucketAudio, key).catch(() => {})
      throw error
    }

    this.loggerService.info('Track audio uploaded', { key, size: file.length, trackId })

    return { audioContentType: contentType, audioFileKey: key, audioFileSize: file.length }
  }
}
