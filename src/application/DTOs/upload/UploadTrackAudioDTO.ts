import { z } from 'zod'

export const UploadTrackAudioSchema = z.object({
  trackId: z.string().uuid(),
})

export type UploadTrackAudioInputDTO = z.infer<typeof UploadTrackAudioSchema>

export type UploadTrackAudioOutputDTO = {
  audioFileKey: string
  audioFileSize: number
  audioContentType: string
}
