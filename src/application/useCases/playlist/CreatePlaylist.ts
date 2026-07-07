import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

import Playlist from '#domain/playlist/Playlist.js'

export class CreatePlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: Input): Promise<Output> {
    const playlist = Playlist.create({
      name:     dto.name,
      ownerId:  dto.ownerId,
      ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
    })
    
    const savedPlaylist = await this.playlistRepo.create(playlist)
    
    return {
      id:        savedPlaylist.id,
      name:      savedPlaylist.name,
      isPublic:  savedPlaylist.isPublic,
      ownerId:   savedPlaylist.ownerId,
      createdAt: savedPlaylist.createdAt,
      updatedAt: savedPlaylist.updatedAt,
    }
  }
}

type Input = {
  name: string
  isPublic?: boolean
  ownerId: string
}

type Output = {
  id: string
  name: string
  isPublic: boolean
  ownerId: string
  createdAt: Date
  updatedAt: Date
}