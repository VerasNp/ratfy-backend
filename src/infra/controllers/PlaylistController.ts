import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

import { PlaylistCreateSchema } from "#application/DTOs/playlist/PlaylistCreateInputDTO.js"
import { PlaylistDeleteSchema } from "#application/DTOs/playlist/PlaylistDeleteInputDTO.js"
import { PlaylistGetSchema } from "#application/DTOs/playlist/PlaylistGetInputDTO.js"
import { PlaylistListSchema } from "#application/DTOs/playlist/PlaylistListInputDTO.js"
import { PlaylistUpdateSchema } from "#application/DTOs/playlist/PlaylistUpdateInputDTO.js"
import { PlaylistListByOwnerIdSchema } from "#application/DTOs/playlist/PlaylistListByOwnerIdInputDTO.js"
import { PlaylistAddTrackSchema } from "#application/DTOs/playlist/PlaylistAddTrackInputDTO.js"
import { PlaylistRemoveTrackSchema } from "#application/DTOs/playlist/PlaylistRemoveTrackInputDTO.js"

import { CreatePlaylistUseCase } from "#application/useCases/playlist/CreatePlaylist.js"
import { DeletePlaylistUseCase } from "#application/useCases/playlist/DeletePlaylist.js"
import { GetPlaylistUseCase } from "#application/useCases/playlist/GetPlaylist.js"
import { ListPlaylistsUseCase } from "#application/useCases/playlist/ListPlaylists.js"
import { UpdatePlaylistUseCase } from "#application/useCases/playlist/UpdatePlaylist.js"
import { ListPlaylistsByOwnerIdUseCase } from "#application/useCases/playlist/ListPlaylistsByOwnerId.js"
import { AddTrackToPlaylistUseCase } from "#application/useCases/playlist/AddTrackToPlaylist.js"
import { RemoveTrackFromPlaylistUseCase } from "#application/useCases/playlist/RemoveTrackFromPlaylist.js"

class PlaylistController {
  public constructor(
    private readonly httpServer:                     HttpServerPort,
    private readonly createPlaylistUseCase:          CreatePlaylistUseCase,
    private readonly getPlaylistUseCase:             GetPlaylistUseCase,
    private readonly updatePlaylistUseCase:          UpdatePlaylistUseCase,
    private readonly deletePlaylistUseCase:          DeletePlaylistUseCase,
    private readonly listPlaylistsUseCase:           ListPlaylistsUseCase,
    private readonly listPlaylistsByOwnerIdUseCase:  ListPlaylistsByOwnerIdUseCase,
    private readonly addTrackToPlaylistUseCase:      AddTrackToPlaylistUseCase,
    private readonly removeTrackFromPlaylistUseCase: RemoveTrackFromPlaylistUseCase,
  ) {
    this.httpServer.register('get', '/playlists', async (_params, _body, query) => {
      const input = PlaylistListSchema.parse(query)
      return this.listPlaylistsUseCase.execute(input)
    })

    this.httpServer.register('post', '/playlists', async (_params, body, _query) => {
      const input = PlaylistCreateSchema.parse(body)
      return this.createPlaylistUseCase.execute(input)
    })

    this.httpServer.register('get', '/playlists/:id', async (params, _body, _query) => {
      const input = PlaylistGetSchema.parse(params)
      return this.getPlaylistUseCase.execute(input)
    })

    this.httpServer.register('get', '/playlists/owner/:ownerId', async (params, _body, query) => {
      const input = PlaylistListByOwnerIdSchema.parse({ ...params, ...query })
      return this.listPlaylistsByOwnerIdUseCase.execute(input)
    })

    this.httpServer.register('patch', '/playlists/:id', async (params, body, _query) => {
      const { id } = PlaylistGetSchema.parse(params)
      const input  = PlaylistUpdateSchema.parse(body)
      return this.updatePlaylistUseCase.execute(id, input)
    })

    this.httpServer.register('delete', '/playlists/:id', async (params, _body, _query) => {
      const input = PlaylistDeleteSchema.parse(params)
      return this.deletePlaylistUseCase.execute(input)
    })

    this.httpServer.register('post', '/playlists/:playlistId/tracks', async (params, body, _query) => {
      const input = PlaylistAddTrackSchema.parse({ 
        playlistId: params.playlistId, 
        trackId: body.trackId 
      })
      return this.addTrackToPlaylistUseCase.execute(input)
    })

    this.httpServer.register('delete', '/playlists/:playlistId/tracks/:trackId', async (params, _body, _query) => {
      const input = PlaylistRemoveTrackSchema.parse(params)
      return this.removeTrackFromPlaylistUseCase.execute(input)
    })
  }
}

export default PlaylistController