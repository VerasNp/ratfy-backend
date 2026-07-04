import crypto from 'crypto'

import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import type { StoragePort } from '#application/ports/StoragePort.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import { mimeToExtension } from './mimeToExtension.js'

export class UploadPlaylistCoverUseCase {
  public constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly storageService: StoragePort,
    private readonly loggerService: LoggerPort,
    private readonly bucketImages: string,
  ) {}

  public async execute(playlistId: string, file: Buffer, contentType: string): Promise<{ coverImageKey: string; coverImageSize: number }> {
    const playlist = await this.playlistRepository.findById(playlistId)
    if (!playlist) throw new PlaylistNotFoundError(playlistId)

    const oldKey = playlist.coverImageKey
    const extension = mimeToExtension(contentType, 'jpg')
    const key = `playlists/${playlistId}/cover-${crypto.randomUUID()}.${extension}`

    await this.storageService.upload(this.bucketImages, key, file, contentType)

    if (oldKey) {
      this.storageService.delete(this.bucketImages, oldKey).catch(() => {
        this.loggerService.warn('Failed to delete old playlist cover', { oldKey, playlistId })
      })
    }

    try {
      await this.playlistRepository.update(playlistId, {
        coverImageKey: key,
        coverImageSize: file.length,
      }, oldKey)
    } catch (error) {
      this.storageService.delete(this.bucketImages, key).catch(() => {})
      throw error
    }

    this.loggerService.info('Playlist cover uploaded', { key, playlistId, size: file.length })

    return { coverImageKey: key, coverImageSize: file.length }
  }
}
