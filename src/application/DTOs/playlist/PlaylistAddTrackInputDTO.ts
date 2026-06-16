import { z } from 'zod'

export const PlaylistAddTrackSchema = z.object({
  playlistId: z.string().uuid('Invalid Playlist ID format.'),
  trackId:    z.string().uuid('Invalid Track ID format.'),
})

export type PlaylistAddTrackInputDTO = z.infer<typeof PlaylistAddTrackSchema>