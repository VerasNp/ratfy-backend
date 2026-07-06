import type { AddFavoriteAlbumUseCase } from '#application/useCases/favorite/AddFavoriteAlbum.js'
import type { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import type { AddFavoritePlaylistUseCase } from '#application/useCases/favorite/AddFavoritePlaylist.js'
import type { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import type { ListFavoriteAlbumsUseCase } from '#application/useCases/favorite/ListFavoriteAlbums.js'
import type { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import type { ListFavoritePlaylistsUseCase } from '#application/useCases/favorite/ListFavoritePlaylists.js'
import type { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import type { RemoveFavoriteAlbumUseCase } from '#application/useCases/favorite/RemoveFavoriteAlbum.js'
import type { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import type { RemoveFavoritePlaylistUseCase } from '#application/useCases/favorite/RemoveFavoritePlaylist.js'
import type { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

import { FavoriteAddAlbumSchema, FavoriteAddArtistSchema, FavoriteAddPlaylistSchema, FavoriteAddTrackSchema, FavoriteRemoveAlbumSchema, FavoriteRemoveArtistSchema, FavoriteRemovePlaylistSchema, FavoriteRemoveTrackSchema } from '#infra/http/schemas/FavoritesSchemas.js'

class FavoriteController {
  public constructor(
    private readonly httpServer: HttpServerPort,
    private readonly authMiddleware: AuthMiddleware,
    private readonly addFavoriteTrackUseCase: AddFavoriteTrackUseCase,
    private readonly removeFavoriteTrackUseCase: RemoveFavoriteTrackUseCase,
    private readonly listFavoriteTracksUseCase: ListFavoriteTracksUseCase,
    private readonly addFavoriteArtistUseCase: AddFavoriteArtistUseCase,
    private readonly removeFavoriteArtistUseCase: RemoveFavoriteArtistUseCase,
    private readonly listFavoriteArtistsUseCase: ListFavoriteArtistsUseCase,
    private readonly addFavoritePlaylistUseCase: AddFavoritePlaylistUseCase,
    private readonly removeFavoritePlaylistUseCase: RemoveFavoritePlaylistUseCase,
    private readonly listFavoritePlaylistsUseCase: ListFavoritePlaylistsUseCase,
    private readonly addFavoriteAlbumUseCase: AddFavoriteAlbumUseCase,
    private readonly removeFavoriteAlbumUseCase: RemoveFavoriteAlbumUseCase,
    private readonly listFavoriteAlbumsUseCase: ListFavoriteAlbumsUseCase,
  ) {
    this.httpServer.register(
      'post',
      '/favorites/tracks/:trackId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { trackId } = FavoriteAddTrackSchema.parse(params)
        await this.addFavoriteTrackUseCase.execute({ userId: req.user.userId, trackId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/tracks/:trackId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { trackId } = FavoriteRemoveTrackSchema.parse(params)
        await this.removeFavoriteTrackUseCase.execute({ userId: req.user.userId, trackId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/tracks',
      async (_params: any, _body: any, _query: any, req: any) => {
        const tracks = await this.listFavoriteTracksUseCase.execute({ userId: req.user.userId })
        return { body: tracks }
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'post',
      '/favorites/artists/:artistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { artistId } = FavoriteAddArtistSchema.parse(params)
        await this.addFavoriteArtistUseCase.execute({ userId: req.user.userId, artistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/artists/:artistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { artistId } = FavoriteRemoveArtistSchema.parse(params)
        await this.removeFavoriteArtistUseCase.execute({ userId: req.user.userId, artistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/artists',
      async (_params: any, _body: any, _query: any, req: any) => {
        const artists = await this.listFavoriteArtistsUseCase.execute({ userId: req.user.userId })
        return { body: artists }
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'post',
      '/favorites/playlists/:playlistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { playlistId } = FavoriteAddPlaylistSchema.parse(params)
        await this.addFavoritePlaylistUseCase.execute({ userId: req.user.userId, playlistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/playlists/:playlistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { playlistId } = FavoriteRemovePlaylistSchema.parse(params)
        await this.removeFavoritePlaylistUseCase.execute({ userId: req.user.userId, playlistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/playlists',
      async (_params: any, _body: any, _query: any, req: any) => {
        const playlists = await this.listFavoritePlaylistsUseCase.execute({ userId: req.user.userId })
        return { body: playlists }
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'post',
      '/favorites/albums/:albumId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { albumId } = FavoriteAddAlbumSchema.parse(params)
        await this.addFavoriteAlbumUseCase.execute({ userId: req.user.userId, albumId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/albums/:albumId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { albumId } = FavoriteRemoveAlbumSchema.parse(params)
        await this.removeFavoriteAlbumUseCase.execute({ userId: req.user.userId, albumId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/albums',
      async (_params: any, _body: any, _query: any, req: any) => {
        const albums = await this.listFavoriteAlbumsUseCase.execute({ userId: req.user.userId })
        return { body: albums }
      },
      [this.authMiddleware.handle()],
    )
  }
}

export default FavoriteController
