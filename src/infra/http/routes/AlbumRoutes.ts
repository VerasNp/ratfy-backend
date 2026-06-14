import { Router } from 'express'

import { AlbumCreateSchema } from '#application/DTOs/album/AlbumCreateDTO.js'
import { AlbumUpdateSchema } from '#application/DTOs/album/AlbumUpdateDTO.js'

import { validate } from '../middlewares/AlbumMiddleware'


const router = Router()

router.post('/',         validate(AlbumCreateSchema), albumController.create)
router.patch('/:id',     validate(AlbumUpdateSchema), albumController.update)

export default router
