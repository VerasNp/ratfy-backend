import { z } from 'zod'

export const PlaylistRemoveTrackSchema = z.object({
  playlistId: z.string().uuid('Invalid Playlist ID format.'),
  trackId:    z.string().uuid('Invalid Track ID format.'),
})

export type PlaylistRemoveTrackInputDTO = z.infer<typeof PlaylistRemoveTrackSchema>