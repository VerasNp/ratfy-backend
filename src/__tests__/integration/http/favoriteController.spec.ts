import { createTestServer } from '#__tests__/testServer.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import FavoriteController from '#infra/controllers/FavoriteController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import Track from '#domain/track/Track.js'
import Artist from '#domain/artist/Artist.js'
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'

type FavoriteEntityType = 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'

class FavoriteRepositoryMock implements FavoriteRepository {
  private favorites: { userId: string; entityId: string; entityType: FavoriteEntityType }[] = []

  async add(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    const exists = this.favorites.some(
      (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
    )
    if (!exists) this.favorites.push({ userId, entityId, entityType })
  }

  async remove(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.userId === userId && f.entityId === entityId && f.entityType === entityType),
    )
  }

  async findEntityIdsByUserAndType(userId: string, entityType: FavoriteEntityType): Promise<string[]> {
    return this.favorites.filter((f) => f.userId === userId && f.entityType === entityType).map((f) => f.entityId)
  }

  async isFavorited(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<boolean> {
    return this.favorites.some((f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType)
  }

  async removeAllByEntity(entityId: string, entityType: FavoriteEntityType): Promise<void> {
    this.favorites = this.favorites.filter((f) => !(f.entityId === entityId && f.entityType === entityType))
  }
}

class TrackRepositoryMock implements TrackRepository {
  private tracks: Track[] = []

  constructor(initial: Track[]) { this.tracks = [...initial] }

  async create(track: Track): Promise<Track> { this.tracks.push(track); return track }
  async delete(id: string): Promise<void> {
    const t = this.tracks.find((t) => t.id === id)
    if (t) { (t as any).isDeleted = true; (t as any).isPublic = false }
  }
  async findByAlbumId(albumId: string): Promise<Track[]> { return this.tracks.filter((t) => t.albumId === albumId && !(t as any).isDeleted) }
  async findById(id: string): Promise<Track | null> { return this.tracks.find((t) => t.id === id && !(t as any).isDeleted) ?? null }
  async listByIds(ids: string[]): Promise<Track[]> { return this.tracks.filter((t) => ids.includes(t.id) && !(t as any).isDeleted) }
  async list(_page: number, _limit: number): Promise<Track[]> { return this.tracks.filter((t) => !(t as any).isDeleted) }
  async update(_id: string, _data: Partial<Track>): Promise<void> {}
}

class ArtistRepositoryMock implements ArtistRepository {
  private artists: Artist[] = []

  constructor(initial: Artist[]) { this.artists = [...initial] }

  async create(artist: Artist): Promise<Artist> { this.artists.push(artist); return artist }
  async delete(_id: string): Promise<void> {}
  async findById(id: string): Promise<Artist | null> { return this.artists.find((a) => a.id === id) ?? null }
  async findByUserId(userId: string): Promise<Artist | null> { return this.artists.find((a) => a.userId === userId) ?? null }
  async listByIds(ids: string[]): Promise<Artist[]> { return this.artists.filter((a) => ids.includes(a.id)) }
  async list(_page: number, _limit: number): Promise<Artist[]> { return this.artists }
  async update(_id: string, _data: Partial<Artist>): Promise<void> {}
}

describe('FavoriteController', () => {
  let server: ExpressAdapter
  let trackRepo: TrackRepositoryMock
  let artistRepo: ArtistRepositoryMock
  let favoriteRepo: FavoriteRepositoryMock
  let track: Track
  let artist: Artist
  const authMiddlewareMock = {
    handle: () => (req: any, _res: any, next: any) => {
      req.user = { userId: 'test-user' }
      next()
    },
  }

  beforeEach(() => {
    track = Track.create({
      albumId: 'album-1',
      artistIds: ['artist-1'],
      durationMs: 200000,
      explicit: false,
      name: 'Controller Test Track',
      trackNumber: 1,
    })
    artist = Artist.create({ userId: 'artist-user-1', bio: 'Test bio' })
    trackRepo = new TrackRepositoryMock([track])
    artistRepo = new ArtistRepositoryMock([artist])
    favoriteRepo = new FavoriteRepositoryMock()
    server = createTestServer()

    new FavoriteController(
      server,
      authMiddlewareMock as any,
      new AddFavoriteTrackUseCase(trackRepo, favoriteRepo),
      new RemoveFavoriteTrackUseCase(favoriteRepo),
      new ListFavoriteTracksUseCase(trackRepo, favoriteRepo),
      new AddFavoriteArtistUseCase(artistRepo, favoriteRepo),
      new RemoveFavoriteArtistUseCase(favoriteRepo),
      new ListFavoriteArtistsUseCase(artistRepo, favoriteRepo),
    )
    server.registerErrorHandler()
  })

  describe('POST /favorites/tracks/:trackId', () => {
    it('should return 204 when favoriting a track', async () => {
      const res = await request(server.app).post(`/favorites/tracks/${track.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid trackId', async () => {
      const res = await request(server.app).post('/favorites/tracks/invalid-id')
      expect(res.status).toBe(400)
    })

    it('should return 404 when track does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(server.app).post(`/favorites/tracks/${fakeId}`)
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /favorites/tracks/:trackId', () => {
    it('should return 204 when unfavoriting a track', async () => {
      const res = await request(server.app).delete(`/favorites/tracks/${track.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid trackId', async () => {
      const res = await request(server.app).delete('/favorites/tracks/invalid-id')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /favorites/tracks', () => {
    it('should return empty array when no favorites', async () => {
      const res = await request(server.app).get('/favorites/tracks')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('should return favorited tracks', async () => {
      await request(server.app).post(`/favorites/tracks/${track.id}`)

      const res = await request(server.app).get('/favorites/tracks')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].id).toBe(track.id)
      expect(res.body[0].name).toBe(track.name)
    })
  })

  describe('POST /favorites/artists/:artistId', () => {
    it('should return 204 when favoriting an artist', async () => {
      const res = await request(server.app).post(`/favorites/artists/${artist.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid artistId', async () => {
      const res = await request(server.app).post('/favorites/artists/invalid-id')
      expect(res.status).toBe(400)
    })

    it('should return 404 when artist does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(server.app).post(`/favorites/artists/${fakeId}`)
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /favorites/artists/:artistId', () => {
    it('should return 204 when unfavoriting an artist', async () => {
      const res = await request(server.app).delete(`/favorites/artists/${artist.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid artistId', async () => {
      const res = await request(server.app).delete('/favorites/artists/invalid-id')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /favorites/artists', () => {
    it('should return empty array when no favorites', async () => {
      const res = await request(server.app).get('/favorites/artists')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('should return favorited artists', async () => {
      await request(server.app).post(`/favorites/artists/${artist.id}`)

      const res = await request(server.app).get('/favorites/artists')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].id).toBe(artist.id)
      expect(res.body[0].userId).toBe(artist.userId)
      expect(res.body[0].bio).toBe(artist.bio)
    })
  })
})
