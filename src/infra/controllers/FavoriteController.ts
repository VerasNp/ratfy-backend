import type { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import type { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import type { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

import { AddFavoriteTrackSchema } from '#application/DTOs/favorite/AddFavoriteTrackInputDTO.js'
import { RemoveFavoriteTrackSchema } from '#application/DTOs/favorite/RemoveFavoriteTrackInputDTO.js'
import { TrackListSchema } from '#application/DTOs/track/TrackListInputDTO.js'

class FavoriteController {
  public constructor(
    private readonly httpServer: HttpServerPort,
    private readonly authMiddleware: AuthMiddleware,
    private readonly addFavoriteTrackUseCase: AddFavoriteTrackUseCase,
    private readonly removeFavoriteTrackUseCase: RemoveFavoriteTrackUseCase,
    private readonly listFavoriteTracksUseCase: ListFavoriteTracksUseCase,
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
  }
}

export default FavoriteController
