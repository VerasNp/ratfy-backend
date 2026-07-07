import crypto from 'crypto'

import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { StoragePort } from '#application/ports/StoragePort.js'

import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'
import { mimeToExtension } from './mimeToExtension.js'

export class UploadArtistProfileImageUseCase {
  public constructor(
    private readonly artistRepository: ArtistRepository,
    private readonly storageService: StoragePort,
    private readonly loggerService: LoggerPort,
    private readonly bucketImages: string,
  ) {}

  public async execute(artistId: string, file: Buffer, contentType: string): Promise<{ profileImageKey: string; profileImageSize: number }> {
    const artist = await this.artistRepository.findById(artistId)
    if (!artist) throw new ArtistNotFoundError(artistId)

    const oldKey = artist.profileImageKey
    const extension = mimeToExtension(contentType, 'jpg')
    const key = `artists/${artistId}/profile-${crypto.randomUUID()}.${extension}`

    await this.storageService.upload(this.bucketImages, key, file, contentType)

    if (oldKey) {
      this.storageService.delete(this.bucketImages, oldKey).catch(() => {
        this.loggerService.warn('Failed to delete old artist profile image', { oldKey, artistId })
      })
    }

    try {
      await this.artistRepository.update(artistId, {
        profileImageKey: key,
        profileImageSize: file.length,
      }, oldKey)
    } catch (error) {
      this.storageService.delete(this.bucketImages, key).catch(() => {})
      throw error
    }

    this.loggerService.info('Artist profile image uploaded', { artistId, key, size: file.length })

    return { profileImageKey: key, profileImageSize: file.length }
  }
}
