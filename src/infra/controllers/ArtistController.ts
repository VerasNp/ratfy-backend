import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

import { ArtistCreateSchema } from "#application/DTOs/artist/ArtistCreateInputDTO.js"
import { ArtistDeleteSchema } from "#application/DTOs/artist/ArtistDeleteInputDTO.js"
import { ArtistGetSchema } from "#application/DTOs/artist/ArtistGetInputDTO.js"
import { ArtistListSchema } from "#application/DTOs/artist/ArtistListInputDTO.js"
import { ArtistUpdateSchema } from "#application/DTOs/artist/ArtistUpdateInputDTO.js"
import { ArtistGetByUserIdSchema } from "#application/DTOs/artist/ArtistGetByUserIdInputDTO.js"
import { BecomeArtistSchema } from "#application/DTOs/artist/BecomeArtistInputDTO.js"

import { CreateArtistUseCase } from "#application/useCases/artist/CreateArtist.js"
import { DeleteArtistUseCase } from "#application/useCases/artist/DeleteArtist.js"
import { GetArtistUseCase } from "#application/useCases/artist/GetArtist.js"
import { ListArtistsUseCase } from "#application/useCases/artist/ListArtists.js"
import { UpdateArtistUseCase } from "#application/useCases/artist/UpdateArtist.js"
import { GetArtistByUserIdUseCase } from "#application/useCases/artist/GetArtistByUserId.js"
import BecomeArtistUseCase from "#application/useCases/artist/BecomeArtistUseCase.js"

class ArtistController {
  public constructor(
    private readonly httpServer:               HttpServerPort,
    private readonly createArtistUseCase:      CreateArtistUseCase,
    private readonly getArtistUseCase:         GetArtistUseCase,
    private readonly updateArtistUseCase:      UpdateArtistUseCase,
    private readonly deleteArtistUseCase:      DeleteArtistUseCase,
    private readonly listArtistsUseCase:       ListArtistsUseCase,
    private readonly getArtistByUserIdUseCase: GetArtistByUserIdUseCase,
    private readonly authMiddleware:           AuthMiddleware,
    private readonly becomeArtistUseCase:      BecomeArtistUseCase,
  ) {
    this.httpServer.register('get', '/artists', async (_params, _body, query) => {
      const input = ArtistListSchema.parse(query)
      return this.listArtistsUseCase.execute(input)
    })

    this.httpServer.register('post', '/artists', async (_params, body, _query) => {
      const input = ArtistCreateSchema.parse(body)
      return this.createArtistUseCase.execute(input)
    })

    this.httpServer.register('get', '/artists/:id', async (params, _body, _query) => {
      const input = ArtistGetSchema.parse(params)
      return this.getArtistUseCase.execute(input)
    })

    this.httpServer.register('get', '/artists/user/:userId', async (params, _body, _query) => {
      const input = ArtistGetByUserIdSchema.parse(params)
      return this.getArtistByUserIdUseCase.execute(input)
    })

    this.httpServer.register('patch', '/artists/:id', async (params, body, _query) => {
      const { id } = ArtistGetSchema.parse(params)
      const input  = ArtistUpdateSchema.parse(body)
      return this.updateArtistUseCase.execute(id, input)
    })

    this.httpServer.register('delete', '/artists/:id', async (params, _body, _query) => {
      const input = ArtistDeleteSchema.parse(params)
      return this.deleteArtistUseCase.execute(input)
    })

    this.httpServer.register(
      'post',
      '/become-artist',
      async (_params: any, body: any, _query: any, req: any) => {
        const { userId } = req.user
        const input = BecomeArtistSchema.parse(body)
        const artist = await this.becomeArtistUseCase.execute(userId, input)
        return { body: artist }
      },
      [this.authMiddleware.handle()],
    )
  }
}

export default ArtistController