import { createTestServer } from '#__tests__/testServer.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import { AddFavoritePlaylistUseCase } from '#application/useCases/favorite/AddFavoritePlaylist.js'
import { RemoveFavoritePlaylistUseCase } from '#application/useCases/favorite/RemoveFavoritePlaylist.js'
import { ListFavoritePlaylistsUseCase } from '#application/useCases/favorite/ListFavoritePlaylists.js'
import { AddFavoriteAlbumUseCase } from '#application/useCases/favorite/AddFavoriteAlbum.js'
import { RemoveFavoriteAlbumUseCase } from '#application/useCases/favorite/RemoveFavoriteAlbum.js'
import { ListFavoriteAlbumsUseCase } from '#application/useCases/favorite/ListFavoriteAlbums.js'
import FavoriteController from '#infra/controllers/FavoriteController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { authMiddlewareMock } from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import Album from '#domain/album/Album.js'
import Track from '#domain/track/Track.js'
import Artist from '#domain/artist/Artist.js'
import Playlist from '#domain/playlist/Playlist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'

describe('FavoriteController', () => {
  let server: ExpressAdapter
  let trackRepo: TrackRepository
  let artistRepo: ArtistRepository
  let playlistRepo: PlaylistRepository
  let albumRepo: AlbumRepository
  let favoriteRepo: FavoriteRepository
  let track: Track
  let artist: Artist
  let playlist: Playlist
  let album: Album

  beforeEach(() => {
    const user = createDummyUser()
    const artistEntity = createDummyArtist(user)
    track = createDummyTrack()
    artist = artistEntity
    playlist = createDummyPlaylist(user)
    album = createDummyAlbum({ artists: [artistEntity] })
    trackRepo = new TrackRepositoryMemory([track])
    artistRepo = new ArtistRepositoryMemory([artist])
    playlistRepo = new PlaylistRepositoryMemory([playlist])
    albumRepo = new AlbumRepositoryMemory([album])
    favoriteRepo = new FavoriteRepositoryMemory()
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
      new AddFavoritePlaylistUseCase(playlistRepo, favoriteRepo),
      new RemoveFavoritePlaylistUseCase(favoriteRepo),
      new ListFavoritePlaylistsUseCase(playlistRepo, favoriteRepo),
      new AddFavoriteAlbumUseCase(albumRepo, favoriteRepo),
      new RemoveFavoriteAlbumUseCase(favoriteRepo),
      new ListFavoriteAlbumsUseCase(albumRepo, favoriteRepo),
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
      expect(res.body.data).toEqual([])
    })

    it('should return favorited tracks', async () => {
      await request(server.app).post(`/favorites/tracks/${track.id}`)

      const res = await request(server.app).get('/favorites/tracks')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe(track.id)
      expect(res.body.data[0].title).toBe(track.title)
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
      expect(res.body.data).toEqual([])
    })

    it('should return favorited artists', async () => {
      await request(server.app).post(`/favorites/artists/${artist.id}`)

      const res = await request(server.app).get('/favorites/artists')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe(artist.id)
      expect(res.body.data[0].userId).toBe(artist.userId)
      expect(res.body.data[0].bio).toBe(artist.bio)
    })
  })

  describe('POST /favorites/playlists/:playlistId', () => {
    it('should return 204 when favoriting a playlist', async () => {
      const res = await request(server.app).post(`/favorites/playlists/${playlist.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid playlistId', async () => {
      const res = await request(server.app).post('/favorites/playlists/invalid-id')
      expect(res.status).toBe(400)
    })

    it('should return 404 when playlist does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(server.app).post(`/favorites/playlists/${fakeId}`)
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /favorites/playlists/:playlistId', () => {
    it('should return 204 when unfavoriting a playlist', async () => {
      const res = await request(server.app).delete(`/favorites/playlists/${playlist.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid playlistId', async () => {
      const res = await request(server.app).delete('/favorites/playlists/invalid-id')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /favorites/playlists', () => {
    it('should return empty array when no favorites', async () => {
      const res = await request(server.app).get('/favorites/playlists')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual([])
    })

    it('should return favorited playlists', async () => {
      await request(server.app).post(`/favorites/playlists/${playlist.id}`)

      const res = await request(server.app).get('/favorites/playlists')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe(playlist.id)
      expect(res.body.data[0].name).toBe(playlist.name)
    })
  })

  describe('POST /favorites/albums/:albumId', () => {
    it('should return 204 when favoriting an album', async () => {
      const res = await request(server.app).post(`/favorites/albums/${album.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid albumId', async () => {
      const res = await request(server.app).post('/favorites/albums/invalid-id')
      expect(res.status).toBe(400)
    })

    it('should return 404 when album does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(server.app).post(`/favorites/albums/${fakeId}`)
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /favorites/albums/:albumId', () => {
    it('should return 204 when unfavoriting an album', async () => {
      const res = await request(server.app).delete(`/favorites/albums/${album.id}`)
      expect(res.status).toBe(204)
    })

    it('should return 400 for invalid albumId', async () => {
      const res = await request(server.app).delete('/favorites/albums/invalid-id')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /favorites/albums', () => {
    it('should return empty array when no favorites', async () => {
      const res = await request(server.app).get('/favorites/albums')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual([])
    })

    it('should return favorited albums', async () => {
      await request(server.app).post(`/favorites/albums/${album.id}`)

      const res = await request(server.app).get('/favorites/albums')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe(album.id)
      expect(res.body.data[0].name).toBe(album.name)
    })
  })
})
