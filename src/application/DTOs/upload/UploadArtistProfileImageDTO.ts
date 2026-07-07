import { z } from 'zod'

export const UploadArtistProfileImageSchema = z.object({
  artistId: z.string().uuid(),
})

export type UploadArtistProfileImageInputDTO = z.infer<typeof UploadArtistProfileImageSchema>

export type UploadArtistProfileImageOutputDTO = {
  profileImageKey: string
  profileImageSize: number
}
