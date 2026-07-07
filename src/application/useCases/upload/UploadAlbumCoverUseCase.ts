import crypto from 'crypto'

import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { StoragePort } from '#application/ports/StoragePort.js'

import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import { mimeToExtension } from './mimeToExtension.js'

export class UploadAlbumCoverUseCase {
  public constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly storageService: StoragePort,
    private readonly loggerService: LoggerPort,
    private readonly bucketImages: string,
  ) {}

  public async execute(albumId: string, file: Buffer, contentType: string): Promise<{ coverImageKey: string; coverImageSize: number }> {
    const album = await this.albumRepository.findById(albumId)
    if (!album) throw new AlbumNotFoundError(albumId)

    const oldKey = album.coverImageKey
    const extension = mimeToExtension(contentType, 'jpg')
    const key = `albums/${albumId}/cover-${crypto.randomUUID()}.${extension}`

    await this.storageService.upload(this.bucketImages, key, file, contentType)

    if (oldKey) {
      this.storageService.delete(this.bucketImages, oldKey).catch(() => {
        this.loggerService.warn('Failed to delete old album cover', { oldKey, albumId })
      })
    }

    try {
      await this.albumRepository.update(albumId, {
        coverImageKey: key,
        coverImageSize: file.length,
      }, oldKey)
    } catch (error) {
      this.storageService.delete(this.bucketImages, key).catch(() => {})
      throw error
    }

    this.loggerService.info('Album cover uploaded', { albumId, key, size: file.length })

    return { coverImageKey: key, coverImageSize: file.length }
  }
}
