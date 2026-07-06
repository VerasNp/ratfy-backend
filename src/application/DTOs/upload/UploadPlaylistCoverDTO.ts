import { z } from 'zod'

export const UploadPlaylistCoverSchema = z.object({
  playlistId: z.string().uuid(),
})

export type UploadPlaylistCoverInputDTO = z.infer<typeof UploadPlaylistCoverSchema>

export type UploadPlaylistCoverOutputDTO = {
  coverImageKey: string
  coverImageSize: number
}
