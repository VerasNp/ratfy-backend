import { describe, it, expect, beforeEach } from 'vitest'

import { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'
import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
type FavoriteEntityType = 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'
import Track from '#domain/track/Track.js'
import Artist from '#domain/artist/Artist.js'

class FavoriteRepositoryMemory implements FavoriteRepository {
  private favorites: { userId: string; entityId: string; entityType: FavoriteEntityType }[] = []

  async add(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    const exists = this.favorites.some(
      (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
    )
    if (!exists) {
      this.favorites.push({ userId, entityId, entityType })
    }
  }

  async remove(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.userId === userId && f.entityId === entityId && f.entityType === entityType),
    )
  }

  async findEntityIdsByUserAndType(userId: string, entityType: FavoriteEntityType): Promise<string[]> {
    return this.favorites
      .filter((f) => f.userId === userId && f.entityType === entityType)
      .map((f) => f.entityId)
  }

  async isFavorited(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<boolean> {
    return this.favorites.some(
      (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
    )
  }

  async removeAllByEntity(entityId: string, entityType: FavoriteEntityType): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.entityId === entityId && f.entityType === entityType),
    )
  }
}

class TrackRepositoryMemory implements TrackRepository {
  private tracks: Track[] = []

  constructor(initial?: Track[]) {
    if (initial) this.tracks = [...initial]
  }

  async create(track: Track): Promise<Track> {
    this.tracks.push(track)
    return track
  }

  async delete(id: string): Promise<void> {
    const track = this.tracks.find((t) => t.id === id)
    if (track) {
      Object.assign(track, { isDeleted: true, isPublic: false })
    }
  }

  async findByAlbumId(albumId: string): Promise<Track[]> {
    return this.tracks.filter((t) => t.albumId === albumId && !t.isDeleted)
  }

  async findById(id: string): Promise<Track | null> {
    return this.tracks.find((t) => t.id === id && !t.isDeleted) ?? null
  }

  async listByIds(ids: string[]): Promise<Track[]> {
    return this.tracks.filter((t) => ids.includes(t.id) && !t.isDeleted)
  }

  async list(page: number, limit: number): Promise<Track[]> {
    const start = (page - 1) * limit
    return this.tracks.filter((t) => !t.isDeleted).slice(start, start + limit)
  }

  async update(id: string, _data: Partial<Track>): Promise<void> {
    // no-op for tests
  }
}

describe('Favorite Use Cases', () => {
  const userId = 'user-1'
  let trackRepo: TrackRepositoryMemory
  let favoriteRepo: FavoriteRepositoryMemory
  let addFav: AddFavoriteTrackUseCase
  let removeFav: RemoveFavoriteTrackUseCase
  let listFav: ListFavoriteTracksUseCase
  let track: Track

  beforeEach(() => {
    track = Track.create({
      albumId: 'album-1',
      artistIds: ['artist-1'],
      durationMs: 200000,
      explicit: false,
      name: 'Test Track',
      trackNumber: 1,
    })
    trackRepo = new TrackRepositoryMemory([track])
    favoriteRepo = new FavoriteRepositoryMemory()
    addFav = new AddFavoriteTrackUseCase(trackRepo, favoriteRepo)
    removeFav = new RemoveFavoriteTrackUseCase(favoriteRepo)
    listFav = new ListFavoriteTracksUseCase(trackRepo, favoriteRepo)
  })

  describe('AddFavoriteTrackUseCase', () => {
    it('should add a track to favorites', async () => {
      await addFav.execute({ userId, trackId: track.id })

      const ids = await favoriteRepo.findEntityIdsByUserAndType(userId, 'TRACK')
      expect(ids).toContain(track.id)
    })

    it('should be idempotent when adding same track twice', async () => {
      await addFav.execute({ userId, trackId: track.id })
      await addFav.execute({ userId, trackId: track.id })

      const ids = await favoriteRepo.findEntityIdsByUserAndType(userId, 'TRACK')
      expect(ids).toHaveLength(1)
    })

    it('should throw TrackNotFoundError when track does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await expect(addFav.execute({ userId, trackId: fakeId })).rejects.toThrow(TrackNotFoundError)
    })
  })

  describe('RemoveFavoriteTrackUseCase', () => {
    it('should remove a track from favorites', async () => {
      await addFav.execute({ userId, trackId: track.id })
      await removeFav.execute({ userId, trackId: track.id })

      const ids = await favoriteRepo.findEntityIdsByUserAndType(userId, 'TRACK')
      expect(ids).not.toContain(track.id)
    })

    it('should not throw when removing a non-favorited track', async () => {
      await expect(
        removeFav.execute({ userId, trackId: track.id }),
      ).resolves.toBeUndefined()
    })
  })

  describe('ListFavoriteTracksUseCase', () => {
    it('should return empty list when user has no favorites', async () => {
      const result = await listFav.execute({ userId })
      expect(result).toHaveLength(0)
    })

    it('should return favorited tracks', async () => {
      await addFav.execute({ userId, trackId: track.id })

      const result = await listFav.execute({ userId })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(track.id)
      expect(result[0].name).toBe(track.name)
    })

    it('should exclude soft-deleted tracks from the list', async () => {
      await addFav.execute({ userId, trackId: track.id })
      await trackRepo.delete(track.id)

      const result = await listFav.execute({ userId })
      expect(result).toHaveLength(0)
    })
  })
})

class ArtistRepositoryMemory implements ArtistRepository {
  private artists: Artist[] = []

  constructor(initial?: Artist[]) {
    if (initial) this.artists = [...initial]
  }

  async create(artist: Artist): Promise<Artist> {
    this.artists.push(artist)
    return artist
  }

  async delete(_id: string): Promise<void> {
    // no-op for tests
  }

  async findById(id: string): Promise<Artist | null> {
    return this.artists.find((a) => a.id === id) ?? null
  }

  async findByUserId(userId: string): Promise<Artist | null> {
    return this.artists.find((a) => a.userId === userId) ?? null
  }

  async listByIds(ids: string[]): Promise<Artist[]> {
    return this.artists.filter((a) => ids.includes(a.id))
  }

  async list(_page: number, _limit: number): Promise<Artist[]> {
    return this.artists
  }

  async update(_id: string, _data: Partial<Artist>): Promise<void> {
    // no-op for tests
  }
}

describe('Favorite Artist Use Cases', () => {
  const userId = 'user-1'
  let artistRepo: ArtistRepositoryMemory
  let favoriteRepo: FavoriteRepositoryMemory
  let addFav: AddFavoriteArtistUseCase
  let removeFav: RemoveFavoriteArtistUseCase
  let listFav: ListFavoriteArtistsUseCase
  let artist: Artist

  beforeEach(() => {
    artist = Artist.create({ userId: 'artist-user-1', bio: 'Test bio' })
    artistRepo = new ArtistRepositoryMemory([artist])
    favoriteRepo = new FavoriteRepositoryMemory()
    addFav = new AddFavoriteArtistUseCase(artistRepo, favoriteRepo)
    removeFav = new RemoveFavoriteArtistUseCase(favoriteRepo)
    listFav = new ListFavoriteArtistsUseCase(artistRepo, favoriteRepo)
  })

  describe('AddFavoriteArtistUseCase', () => {
    it('should add an artist to favorites', async () => {
      await addFav.execute({ userId, artistId: artist.id })

      const ids = await favoriteRepo.findEntityIdsByUserAndType(userId, 'ARTIST')
      expect(ids).toContain(artist.id)
    })

    it('should be idempotent when adding same artist twice', async () => {
      await addFav.execute({ userId, artistId: artist.id })
      await addFav.execute({ userId, artistId: artist.id })

      const ids = await favoriteRepo.findEntityIdsByUserAndType(userId, 'ARTIST')
      expect(ids).toHaveLength(1)
    })

    it('should throw ArtistNotFoundError when artist does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await expect(addFav.execute({ userId, artistId: fakeId })).rejects.toThrow(ArtistNotFoundError)
    })
  })

  describe('RemoveFavoriteArtistUseCase', () => {
    it('should remove an artist from favorites', async () => {
      await addFav.execute({ userId, artistId: artist.id })
      await removeFav.execute({ userId, artistId: artist.id })

      const ids = await favoriteRepo.findEntityIdsByUserAndType(userId, 'ARTIST')
      expect(ids).not.toContain(artist.id)
    })

    it('should not throw when removing a non-favorited artist', async () => {
      await expect(
        removeFav.execute({ userId, artistId: artist.id }),
      ).resolves.toBeUndefined()
    })
  })

  describe('ListFavoriteArtistsUseCase', () => {
    it('should return empty list when user has no favorites', async () => {
      const result = await listFav.execute({ userId })
      expect(result).toHaveLength(0)
    })

    it('should return favorited artists', async () => {
      await addFav.execute({ userId, artistId: artist.id })

      const result = await listFav.execute({ userId })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(artist.id)
      expect(result[0].userId).toBe(artist.userId)
      expect(result[0].bio).toBe(artist.bio)
    })
  })
})
