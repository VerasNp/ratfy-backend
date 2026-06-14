import type { Request, Response } from 'express'

import type { CreateAlbumUseCase } from '#application/useCases/album/CreateAlbum.js';

import { AlbumCreateSchema } from "#application/DTOs/album/AlbumCreateDTO.js";

import { AlbumUpdateSchema } from "#application/DTOs/album/AlbumUpdateDTO.js";

export class AlbumController {
  constructor(
    private readonly createAlbum:  CreateAlbumUseCase,
    private readonly getAlbum:     GetAlbumUseCase,
    private readonly updateAlbum:  UpdateAlbumUseCase,
    private readonly deleteAlbum:  DeleteAlbumUseCase,
    private readonly listAlbums:   ListAlbumsUseCase,
  ) {

  }
}
