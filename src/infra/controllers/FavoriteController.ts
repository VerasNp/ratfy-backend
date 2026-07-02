import type { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import type { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import type { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import type { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import type { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import type { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import type { AddFavoritePlaylistUseCase } from '#application/useCases/favorite/AddFavoritePlaylist.js'
import type { RemoveFavoritePlaylistUseCase } from '#application/useCases/favorite/RemoveFavoritePlaylist.js'
import type { ListFavoritePlaylistsUseCase } from '#application/useCases/favorite/ListFavoritePlaylists.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

import { AddFavoriteTrackSchema } from '#application/DTOs/favorite/AddFavoriteTrackInputDTO.js'
import { RemoveFavoriteTrackSchema } from '#application/DTOs/favorite/RemoveFavoriteTrackInputDTO.js'
import { AddFavoriteArtistSchema } from '#application/DTOs/favorite/AddFavoriteArtistInputDTO.js'
import { RemoveFavoriteArtistSchema } from '#application/DTOs/favorite/RemoveFavoriteArtistInputDTO.js'
import { AddFavoritePlaylistSchema } from '#application/DTOs/favorite/AddFavoritePlaylistInputDTO.js'
import { RemoveFavoritePlaylistSchema } from '#application/DTOs/favorite/RemoveFavoritePlaylistInputDTO.js'
import { TrackListSchema } from '#application/DTOs/track/TrackListInputDTO.js'

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
  ) {
    this.httpServer.register(
      'post',
      '/favorites/tracks/:trackId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { trackId } = AddFavoriteTrackSchema.parse(params)
        await this.addFavoriteTrackUseCase.execute({ userId: req.user.userId, trackId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/tracks/:trackId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { trackId } = RemoveFavoriteTrackSchema.parse(params)
        await this.removeFavoriteTrackUseCase.execute({ userId: req.user.userId, trackId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/tracks',
      async (_params: any, _body: any, _query: any, req: any) => {
        const tracks = await this.listFavoriteTracksUseCase.execute({ userId: req.user.userId })
        return tracks
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'post',
      '/favorites/artists/:artistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { artistId } = AddFavoriteArtistSchema.parse(params)
        await this.addFavoriteArtistUseCase.execute({ userId: req.user.userId, artistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/artists/:artistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { artistId } = RemoveFavoriteArtistSchema.parse(params)
        await this.removeFavoriteArtistUseCase.execute({ userId: req.user.userId, artistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/artists',
      async (_params: any, _body: any, _query: any, req: any) => {
        const artists = await this.listFavoriteArtistsUseCase.execute({ userId: req.user.userId })
        return artists
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'post',
      '/favorites/playlists/:playlistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { playlistId } = AddFavoritePlaylistSchema.parse(params)
        await this.addFavoritePlaylistUseCase.execute({ userId: req.user.userId, playlistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'delete',
      '/favorites/playlists/:playlistId',
      async (params: any, _body: any, _query: any, req: any) => {
        const { playlistId } = RemoveFavoritePlaylistSchema.parse(params)
        await this.removeFavoritePlaylistUseCase.execute({ userId: req.user.userId, playlistId })
      },
      [this.authMiddleware.handle()],
    )

    this.httpServer.register(
      'get',
      '/favorites/playlists',
      async (_params: any, _body: any, _query: any, req: any) => {
        const playlists = await this.listFavoritePlaylistsUseCase.execute({ userId: req.user.userId })
        return playlists
      },
      [this.authMiddleware.handle()],
    )
  }
}

export default FavoriteController
