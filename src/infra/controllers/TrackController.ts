import type { CreateTrackUseCase } from '#application/useCases/track/CreateTrack.js'
import type { DeleteTrackUseCase } from '#application/useCases/track/DeleteTrack.js'
import type { GetTrackUseCase }    from '#application/useCases/track/GetTrack.js'
import type { ListTracksUseCase }  from '#application/useCases/track/ListTrack.js'
import type { UpdateTrackUseCase } from '#application/useCases/track/UpdateTrack.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

import { TrackCreateSchema } from '#application/DTOs/track/TrackCreateInputDTO.js'
import { TrackDeleteSchema } from '#application/DTOs/track/TrackDeleteInputDTO.js'
import { TrackGetSchema }    from '#application/DTOs/track/TrackGetInputDTO.js'
import { TrackListSchema }   from '#application/DTOs/track/TrackListInputDTO.js'
import { TrackUpdateSchema } from '#application/DTOs/track/TrackUpdateInputDTO.js'



class TrackController {
  public constructor(
    private readonly httpServer:          HttpServerPort,
    private readonly createTrackUseCase:  CreateTrackUseCase,
    private readonly getTrackUseCase:     GetTrackUseCase,
    private readonly updateTrackUseCase:  UpdateTrackUseCase,
    private readonly deleteTrackUseCase:  DeleteTrackUseCase,
    private readonly listTracksUseCase:   ListTracksUseCase,
  ) {
    this.httpServer.register('get', '/tracks', async (_params, _body, query) => {
      const input = TrackListSchema.parse(query)
      return this.listTracksUseCase.execute(input)
    })

    this.httpServer.register('post', '/tracks', async (_params, body, _query) => {
      const input = TrackCreateSchema.parse(body)
      return this.createTrackUseCase.execute(input)
    })

    this.httpServer.register('get', '/tracks/:id', async (params, _body, _query) => {
      const input = TrackGetSchema.parse(params)
      return this.getTrackUseCase.execute(input)
    })

    this.httpServer.register('patch', '/tracks/:id', async (params, body, _query) => {
      const { id } = TrackGetSchema.parse(params)
      const input  = TrackUpdateSchema.parse(body)
      return this.updateTrackUseCase.execute(id, input)
    })

    this.httpServer.register('delete', '/tracks/:id', async (params, _body, _query) => {
      const input = TrackDeleteSchema.parse(params)
      return this.deleteTrackUseCase.execute(input)
    })
    this.httpServer.register('get', '/albums/:id/tracks', async (params, _body, query) => {
      const { id: albumId } = TrackGetSchema.parse(params)
      const input           = TrackListSchema.parse({ ...query, albumId })
      return this.listTracksUseCase.execute(input)
    })
  }
}

export default TrackController
