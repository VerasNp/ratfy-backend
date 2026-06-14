import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'

import { AlbumCreateSchema } from '#application/DTOs/album/AlbumCreateDTO.js'
import { AlbumUpdateSchema } from '#application/DTOs/album/AlbumUpdateDTO.js'
import { CreateAlbumUseCase } from '#application/useCases/album/CreateAlbum.js'
import { DeleteAlbumUseCase } from '#application/useCases/album/DeleteAlbum.js'
import { GetAlbumUseCase }    from '#application/useCases/album/GetAlbum.js'
import { ListAlbumsUseCase }  from '#application/useCases/album/ListAlbums.js'
import { UpdateAlbumUseCase } from '#application/useCases/album/UpdateAlbum.js'

import { AlbumController } from '../../controllers/AlbumControler.js'
import AlbumRepositoryPrisma from '../../repository/AlbumRepositoryPrisma.js'
import { validate } from '../middlewares/AlbumMiddleware'

export function makeAlbumRouter(prisma: PrismaClient): Router {
  const repo       = new AlbumRepositoryPrisma(prisma)
  const controller = new AlbumController(
    new CreateAlbumUseCase(repo),
    new GetAlbumUseCase(repo),
    new UpdateAlbumUseCase(repo),
    new DeleteAlbumUseCase(repo),
    new ListAlbumsUseCase(repo),
  )

  // ── Routes ─────────────────────────────────────────────────────────────
  const router = Router()

  router.get   ('/',    controller.list)
  router.post  ('/',    validate(AlbumCreateSchema), controller.create)
  router.get   ('/:id', controller.getById)
  router.patch ('/:id', validate(AlbumUpdateSchema), controller.update)
  router.delete('/:id', controller.delete)

  return router
}
