import { z } from 'zod'

export const UploadAlbumCoverSchema = z.object({
  albumId: z.string().uuid(),
})

export type UploadAlbumCoverInputDTO = z.infer<typeof UploadAlbumCoverSchema>

export type UploadAlbumCoverOutputDTO = {
  coverImageKey: string
  coverImageSize: number
}
