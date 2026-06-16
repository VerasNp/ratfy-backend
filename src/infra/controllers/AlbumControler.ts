import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

import { AlbumCreateSchema } from "#application/DTOs/album/AlbumCreateInputDTO.js"
import { AlbumDeleteSchema } from "#application/DTOs/album/AlbumDeleteInputDTO.js"
import { AlbumGetSchema } from "#application/DTOs/album/AlbumGetInputDTO.js"
import { AlbumListSchema } from "#application/DTOs/album/AlbumListInputDTO.js"
import { AlbumUpdateSchema } from "#application/DTOs/album/AlbumUpdateInputDTO.js"
import { CreateAlbumUseCase } from "#application/useCases/album/CreateAlbum.js"
import { DeleteAlbumUseCase } from "#application/useCases/album/DeleteAlbum.js"
import { GetAlbumUseCase } from "#application/useCases/album/GetAlbum.js"
import { ListAlbumsUseCase } from "#application/useCases/album/ListAlbums.js"
import { UpdateAlbumUseCase } from "#application/useCases/album/UpdateAlbum.js"
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'


class AlbumController {
  public constructor(
    private readonly httpServer:        HttpServerPort,
    private readonly createAlbumUseCase: CreateAlbumUseCase,
    private readonly getAlbumUseCase:    GetAlbumUseCase,
    private readonly updateAlbumUseCase: UpdateAlbumUseCase,
    private readonly deleteAlbumUseCase: DeleteAlbumUseCase,
    private readonly listAlbumsUseCase:  ListAlbumsUseCase,
	private readonly authMiddleware: AuthMiddleware,
  ) {
    this.httpServer.register('get', '/albums', async (_params, _body, query) => {
      const input = AlbumListSchema.parse(query)
      return this.listAlbumsUseCase.execute(input)
    }, [this.authMiddleware.handle()])

    this.httpServer.register('post', '/albums', async (_params, body, _query) => {
      const input = AlbumCreateSchema.parse(body)
      return this.createAlbumUseCase.execute(input)
    }, [this.authMiddleware.handle()])

    this.httpServer.register('get', '/albums/:id', async (params, _body, _query) => {
      const input = AlbumGetSchema.parse(params)
      return this.getAlbumUseCase.execute(input)
    }, [this.authMiddleware.handle()])

    this.httpServer.register('patch', '/albums/:id', async (params, body, _query) => {
      const { id } = AlbumGetSchema.parse(params)
      const input  = AlbumUpdateSchema.parse(body)
      return this.updateAlbumUseCase.execute(id, input)
    }, [this.authMiddleware.handle()])

    this.httpServer.register('delete', '/albums/:id', async (params, _body, _query) => {
      const input = AlbumDeleteSchema.parse(params)
      return this.deleteAlbumUseCase.execute(input)
    }, [this.authMiddleware.handle()])
  }
}

export default AlbumController
