import type { Request, Response } from 'express'

import type { CreateAlbumDTO } from '#application/DTOs/album/AlbumCreateDTO.js'
import type { UpdateAlbumDTO } from '#application/DTOs/album/AlbumUpdateDTO.js'
import type { CreateAlbumUseCase }  from '#application/useCases/album/CreateAlbum.js'
import type { DeleteAlbumUseCase }  from '#application/useCases/album/DeleteAlbum.js'
import type { GetAlbumUseCase }     from '#application/useCases/album/GetAlbum.js'
import type { ListAlbumsUseCase }   from '#application/useCases/album/ListAlbums.js'
import type { UpdateAlbumUseCase }  from '#application/useCases/album/UpdateAlbum.js'

import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'

export class AlbumController {
  constructor(
    private readonly createAlbumUseCase: CreateAlbumUseCase,
    private readonly getAlbumUseCase:    GetAlbumUseCase,
    private readonly updateAlbumUseCase: UpdateAlbumUseCase,
    private readonly deleteAlbumUseCase: DeleteAlbumUseCase,
    private readonly listAlbumsUseCase:  ListAlbumsUseCase,
  ) { }
  /**
   * @openapi
   * /albums:
   *   post:
   *     summary: Create a new album
   *     tags: [Albums]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateAlbumDTO'
   *     responses:
   *       201:
   *         description: Album created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Album'
   *       422:
   *         description: Validation error
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto   = req.body as CreateAlbumDTO
      const album = await this.createAlbumUseCase.execute(dto)
      res.status(201).json(album)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  /**
   * @openapi
   * /albums/{id}:
   *   delete:
   *     summary: Soft-delete an album
   *     tags: [Albums]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: Album deleted successfully
   *       404:
   *         description: Album not found
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.deleteAlbumUseCase.execute(req.params.id)
      res.status(204).send()
    } catch (error) {
      this.handleError(error, res)
    }
  }
  /**
   * @openapi
   * /albums/{id}:
   *   get:
   *     summary: Get an album by ID
   *     tags: [Albums]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: The album
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Album'
   *       404:
   *         description: Album not found
   */
	getById = async (req: Request, res: Response): Promise<void> => {
		try {
		    const album = await this.getAlbumUseCase.execute(req.params.id)
		    res.status(200).json(album)
		} catch (error) {
		    this.handleError(error, res)
		}
	}
  /**
   * @openapi
   * /albums:
   *   get:
   *     summary: List albums (paginated)
   *     tags: [Albums]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 20
   *     responses:
   *       200:
   *         description: Paginated list of albums
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Album'
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const page  = Math.max(1,  parseInt(req.query.page  as string) || 1)
      const limit = Math.min(50, parseInt(req.query.limit as string) || 20)
      const albums = await this.listAlbumsUseCase.execute({ page, limit })
      res.status(200).json(albums)
    } catch (error) {
      this.handleError(error, res)
    }
  }
  /**
   * @openapi
   * /albums/{id}:
   *   patch:
   *     summary: Partially update an album
   *     tags: [Albums]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAlbumDTO'
   *     responses:
   *       204:
   *         description: Album updated successfully
   *       404:
   *         description: Album not found
   *       422:
   *         description: Validation error
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as UpdateAlbumDTO
      await this.updateAlbumUseCase.execute(req.params.id, dto)
      res.status(204).send()
    } catch (error) {
      this.handleError(error, res)
    }
  }
  private handleError(error: unknown, res: Response): void {
    if (error instanceof AlbumNotFoundError) {
      res.status(404).json({ message: error.message })
      return
    }
    if (error instanceof Error) {
      res.status(500).json({ message: 'Internal server error', detail: error.message })
      return
    }
    res.status(500).json({ message: 'Unknown error' })
  }
}
